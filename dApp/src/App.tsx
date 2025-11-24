import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from '../pages/Home.tsx'
import Login from '../pages/Login.tsx'
import Dashboard from '../pages/Dashboard.tsx'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Login" element={<Login/>}/>
          <Route path="/Dashboard" element={<Dashboard/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
