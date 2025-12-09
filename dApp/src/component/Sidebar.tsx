import { useDisconnect } from "wagmi"
import { useNavigate } from "react-router-dom"

export default function Sidebar() {
    const { disconnect } = useDisconnect()
    const navigate = useNavigate()

    const handleLogout = () => {
        disconnect()
        navigate('/')
    }

    return(
        <div>
            <h1 className="text-2xl font-semibold">Voting</h1>

            <ul className="flex flex-col gap-3 my-6">
                <li><a href="">Dashboard</a></li>
                <li><a href="">Create Voting</a></li>
                <li><a href="">My Voting</a></li>
                <li><a href="">Result</a></li>
            </ul>

            <button 
                onClick={handleLogout}
                className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
                Disconnect
            </button>
        </div>
    )
}