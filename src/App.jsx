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

function SubdomainNode({node}) {
  return (
    <li>
      {node.filterId || node.subdomain}
      <ul>
        {node.children.map(subnode => <SubdomainNode node={subnode} />)}
      </ul>
    </li>
  )
}

export default App
