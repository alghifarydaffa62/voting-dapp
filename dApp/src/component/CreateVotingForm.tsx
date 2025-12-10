import { useState } from "react"

export default function CreateVotingForm() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    
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
                    type="submit" 
                    className="p-3 bg-blue-500 text-white font-semibold text-lg rounded-lg cursor-pointer max-w-lg"
                >Create Voting</button>
            </form>
        </div>
        
    )
}