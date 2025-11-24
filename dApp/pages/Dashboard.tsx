import { useAccount, useDisconnect } from "wagmi"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Dashboard() {
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const navigate = useNavigate()

    useEffect(() => {
        if(!isConnected) {
            navigate('/')
        }
    }, [isConnected, navigate])

    const handleLogout = () => {
        disconnect()
        navigate('/')
    }

    return(
        <div>
            <h1 className="text-center text-3xl font-semibold">DASHBOARD</h1>
            <h1 className="text-xl">Connected address: {address}</h1>

            <button 
                onClick={handleLogout}
                className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
                Disconnect
            </button>
        </div>
    )
}