import { useState } from "react"

export default function CreateVotingForm() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [deadline, setDeadline] = useState("")
    
    return(
        <form>
            <div>
                <label htmlFor="title" className="">Voting Name:</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-2 border border-blue-500 rounded-md"
                />
            </div>

            <div>
                <label htmlFor="description">
                    Description: 
                </label>
                <input 
                    type="text" 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="p-2 rounded-md border border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="deadline">
                    Input deadline:
                </label>
                <input 
                    type="datetime-local" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="rounded-md p-2 border border-blue-500"
                />
            </div>
        </form>
    )
}