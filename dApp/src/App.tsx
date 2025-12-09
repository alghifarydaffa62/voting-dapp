import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import CreateVotingForm from "./component/CreateVotingForm.tsx"
import Main from "./component/Main.tsx"
import DashboardLayout from "./layout/DashboardLayout.tsx"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/dashboard" element={<DashboardLayout/>}>
            <Route index element={<Main/>}/>
            <Route path="create" element={<CreateVotingForm/>}/>
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
