import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import metamask from "../assets/MetaMask.svg"
import { useConnect, useAccount } from "wagmi"

export default function Login() {
    const account = useAccount()
    const { connectors, connect } = useConnect()
    const navigate = useNavigate()

    useEffect(() => {
        if(account.status === 'connected' && account.address) {
            navigate('/dashboard');
        }
    }, [account.status, account.address, navigate])

    const handleLogin = () => {
        const connector = connectors.find((c) => c.name === 'MetaMask' || c.id === 'io.metamask')

        if(connector) {
            connect({connector})
        } else {
            alert("MetaMask Not Installed!")
        }
    }

    return(
        <div>
            <h1 className="text-center text-3xl font-semibold">Please connect your wallet</h1>
            {account.status === 'connecting' && (
                <p className="text-amber-600 font-medium animate-pulse">Connecting to Wallet...</p>
            )}

            <button 
                onClick={handleLogin} 
                disabled={account.status === 'connecting'}
                className="cursor-pointer flex justify-center gap-4 p-4 rounded-lg items-center bg-amber-600 w-fit"
            >
                <h1 className="text-xl font-semibold text-white">Connect With Metamask</h1>
                <img src={metamask} alt="" className="w-8"/>
            </button>
        </div>
    )
}