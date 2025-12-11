import { useCreateVoting } from "../hooks/useCreateVoting"
import { Loader2, CheckCircle } from "lucide-react";

export default function CreateVotingForm() {
    const {
        title, setTitle,
        desc, setDesc,
        createVoting,
        isLoading, 
        isSuccess,
        txHash
    } = useCreateVoting()
    
    if (isSuccess) {
        return (
            <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800">Voting Creation succedd</h2>
                <p className="text-green-600 mt-2 break-all">Tx Hash: {txHash}</p>
                
            </div>
        );
    }

    return(
        <div>
            <h1 className="text-2xl font-semibold mb-5">Create new voting</h1>
            
            <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="">Voting Name:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="p-2 border border-blue-500 rounded-md max-w-lg"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="description">
                        Description: 
                    </label>
                    <input 
                        type="text" 
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="p-2 rounded-md border border-blue-500 max-w-lg"
                    />
                </div>

                <button
                    onClick={createVoting}
                    disabled={isLoading || !title || !desc}
                    className="cursor-pointer w-full bg-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" /> Processing...
                        </>
                    ) : (
                        "🚀 Deploy Voting ke Blockchain"
                    )}
                </button>
            </form>
        </div>
        
    )
}