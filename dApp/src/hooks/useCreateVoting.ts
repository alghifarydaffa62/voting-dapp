import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { uploadMetadata } from "../utils/uploadMetadata";
import VotingFactoryABI from "../abi/VotingFactory.json"

const FACTORY_ADDRESS = "0x7c0eDfA74C2c5A066255ED1C481658247Fb21a07"

export function useCreateVoting() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const { data: hash, writeContract, isPending: isTxPending, error: txError } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash
    })

    const createVoting = async () => {
        try {
            setIsUploading(true)
            const metadata = { title, desc }
            const ipfsHash = await uploadMetadata(metadata)
            setIsUploading(false)
            console.log("Metadata uploaded:", ipfsHash);

            writeContract({
                address: FACTORY_ADDRESS,
                abi: VotingFactoryABI.abi,
                functionName: "createVoting",
                args: [ipfsHash]
            })
        } catch(error) {
            console.error("Error creating voting: ", error)
            setIsUploading(false)
        }
    } 

    return {
        title,
        setTitle,
        desc,
        setDesc,
        createVoting,
        isLoading: isUploading || isTxPending || isConfirming,
        isSuccess,
        txHash: hash,
        error: txError
    }
}