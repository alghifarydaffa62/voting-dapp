import { useAccount } from "wagmi"

export default function Main() {
    const { address } = useAccount()

    return(
        <div>
            <h1>Connected Wallet: {address}</h1>
            <h1>Welcome to voting dApp</h1>
        </div>
    )
}