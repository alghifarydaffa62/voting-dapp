import { useAccount } from "wagmi"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Sidebar from "../component/Sidebar"
import Main from "../component/Main"

export default function Dashboard() {
    const { isConnected } = useAccount()
    const navigate = useNavigate()

    useEffect(() => {
        if(!isConnected) {
            navigate('/')
        }
    }, [isConnected, navigate])

    return(
        <div className="flex justify-center gap-20">
            <Sidebar/>
            <Main/>
        </div>
    )
}