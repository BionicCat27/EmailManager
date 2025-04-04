import { useState, useEffect } from 'react'
import {
  initGapiClient,
  signIn,
  listFilters
} from './gmailClient'
import './App.css'

function App() {

  const [filters, setFilters] = useState([]);

  useEffect(()=> {
    initGapiClient().then(()=> {
      signIn().then(()=> {
        listFilters().then((response) => {
          setFilters(response.result.filter || [] );
        })
      })
    })
  }, [])
  
  return (
    <>
      <h1>Email Filter Manager</h1>
      <h2>Filters</h2>
      <ul>
        {filters.map((filter) => (
          <li key={filter.id}>
            {filter.criteria?.from || "no criteria"} - {filter.action?.addlabelIds?.join(", ")}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
