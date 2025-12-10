import { useAccount, useEnsName } from "wagmi"

export default function Welcome() {
    const { address } = useAccount()
    const { data: ensName } = useEnsName({ address })
    
    const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Voter')

    return(
        <div>
            <h1 className="text-xl">Hello <span className="text-amber-600">{displayName}</span> 👋</h1>
            <h1 className="text-xl font-semibold">Welcome to voting dApp</h1>
        </div>
    )
}