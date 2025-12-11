import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import CreatePage from "./pages/CreatePage.tsx"
import Dashboard from "./pages/Dashboard.tsx"
import DashboardLayout from "./layout/DashboardLayout.tsx"
import MyCampaigns from "./pages/MyCampaigns.tsx"
import ActiveVotes from "./pages/ActiveVotes.tsx"
import History from "./pages/History.tsx"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/dashboard" element={<DashboardLayout/>}>
            <Route index element={<Dashboard/>}/>
            <Route path="create" element={<CreatePage/>}/>
            <Route path="MyCampaigns" element={<MyCampaigns/>}/>
            <Route path="active" element={<ActiveVotes/>}/>
            <Route path="result" element={<History/>}/>
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
