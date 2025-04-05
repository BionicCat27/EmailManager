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
    </>
  )
}

export default App
