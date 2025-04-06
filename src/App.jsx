import { useState, useEffect } from 'react'
import {
  initGapiClient,
  signIn,
  listFilters,
  listLabels
} from './gmailClient'
import './App.css'

function App() {

  const [filters, setFilters] = useState([]);
  const [filtersTree, setFiltersTree] = useState({});
  const [labels, setLabels] = useState([]);

  useEffect(()=> {
    initGapiClient().then(()=> {
      signIn().then(()=> {
        listFilters().then((response) => {
          console.log(response)
          setFilters(response.result.filter || [] );
        })
        listLabels().then((response) => {
          console.log(response)
          setLabels(response.result.labels || [] );
        })
      })
    })
  }, [])

  useEffect(()=>{
    let filtersTree = [];
    for (let filterI in Object.entries(filters)) {
      let filter = filters.at(filterI);
      let filterObj = {
        "filterId": filter.id,
        "children": []
      }
      let criteria = filter.criteria?.from.split(" OR ");
      for (let criterionI in criteria) {
        let criterion = criteria.at(criterionI)
        let subdomains =  criterion.split(".").reverse();
        
        let lastObj = filterObj;
        for (let subdomainI in subdomains) {
          let subdomain = subdomains.at(subdomainI)
          let existingSubdomain = lastObj.children?.find(child => child.subdomain === subdomain)
          if (existingSubdomain) {
            lastObj = existingSubdomain
            continue;
          }
          let newObj = {
            "subdomain": subdomain,
            "children": []
          }
          lastObj.children.push(newObj)
          lastObj = newObj
        }
      }
      filtersTree.push(filterObj)
    }
    setFiltersTree(filtersTree);
  }, [filters])
  
  return (
    <>
      <h1>Email Filter Manager</h1>
      <h2>Labels</h2>
      <ul>
        {labels.map((label) => (
          <li style={{backgroundColor: label.color}} key={label.id}>
            {label.name}
          </li>
        ))}
      </ul>
      <h2>Filters</h2>
      <ul>
        {filters.map((filter) => (
          <li key={filter.id}>
            {filter.criteria?.from || "no criteria"} - {
              filter.action?.addLabelIds?.map((labelId) => labels.find((label) => label.id === labelId)?.name)?.join(", ")
            }
          </li>
        ))}
      </ul>
      <h2>Filter Criteria Subdomain Trees</h2>
      <ul>
        {filtersTree.length > 0 && filtersTree.map(filterRoot => (
          <>
            <SubdomainNode node={filterRoot} />
          </>
        ))}
      </ul>
    </>
  )
}

function SubdomainNode({node, selected, checkboxClicked}) {
  const [hovering, setHovering] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const isEndNode = node.children.length == 0
  const isRootNode = node.filterId

  function handleChange(checked, subdomain) {
    let sc = [...selectedChildren]
    let existingSelectedChild = sc.find(child => child.subdomain === subdomain)
    if (checked && !existingSelectedChild) {
      let selectedChild = node.children.find(child => child.subdomain === subdomain)
      sc.push(selectedChild)
    } else if (!checked && existingSelectedChild) {
      sc = sc.filter(child => child.subdomain !== subdomain)
    }
    setSelectedChildren(sc)
  }

  function toggleHover(e, hover) {
    setHovering(hover);
  }

  return (
    <li
    onMouseEnter={(e)=>toggleHover(e, true)}
    onMouseLeave={(e)=>toggleHover(e, false)}
    onClick={(e)=>isEndNode && checkboxClicked(!selected, node.subdomain)}
     className={"subdomain-node" + (isRootNode ? " root-node" : "") + (isEndNode ? " end-node" : "")}>
      {node.filterId || node.subdomain}
      
      {selectedChildren.length > 0 &&
        <ul id="selectedNodes">
          <input disabled={selectedChildren.length < 2}/>
          <button disabled={selectedChildren.length < 2}>Replace filter(s)</button>
          {
            selectedChildren.map(subnode => <SubdomainNode selected={selectedChildren.find(child => child.subdomain === subnode.subdomain) ? true : false} checkboxClicked={handleChange} node={subnode} />)
          }
        </ul>
      }
      <ul>
        {
          node.children.filter(child => !selectedChildren.includes(child))
            .map(subnode => <SubdomainNode selected={selectedChildren.find(child => child.subdomain === subnode.subdomain) ? true : false} checkboxClicked={handleChange} node={subnode} />)
        }
      </ul>
      {isEndNode && (hovering || selected) && (
        <input type="checkbox" checked={selected} onChange={(e) => checkboxClicked(e.target.checked, node.subdomain)}/>
      )}
    </li>
  )
}

export default App
