import { useDisconnect } from "wagmi"
import { useNavigate, NavLink } from "react-router-dom"
import { 
    LayoutDashboard, 
    PlusCircle, 
    Vote, 
    History, 
    LogOut,
    FileText
} from "lucide-react"

export default function Sidebar() {
    const { disconnect } = useDisconnect()
    const navigate = useNavigate()

    const handleLogout = () => {
        disconnect()
        navigate('/')
    }

    const getLinkClass = ({ isActive }: { isActive: boolean }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive 
            ? "bg-amber-100 text-amber-700 font-bold shadow-sm" 
            : "text-gray-500 hover:bg-gray-50 hover:text-amber-600 font-medium"
        }`

    return(
        <div className="w-[260px] h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col z-50">

            <div className="p-8 pb-4">
                <div className="flex items-center gap-2 text-amber-600">
                    <Vote size={32} />
                    <h1 className="text-2xl font-extrabold tracking-tight">BlockVote</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                    Main Menu
                </p>

                <NavLink to="/dashboard" end className={getLinkClass}>
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>

                <NavLink to="/dashboard/active" className={getLinkClass}>
                    <Vote size={20} />
                    Active Votes
                </NavLink>

                <NavLink to="/dashboard/result" className={getLinkClass}>
                    <History size={20} />
                    History & Results
                </NavLink>

                <div className="my-4 border-t border-gray-100"></div>
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Creator Zone
                </p>

                <NavLink to="/dashboard/create" className={getLinkClass}>
                    <PlusCircle size={20} />
                    Create Voting
                </NavLink>

                <NavLink to="/dashboard/my-campaigns" className={getLinkClass}>
                    <FileText size={20} />
                    My Campaigns
                </NavLink>
            </div>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-semibold"
                >
                    <LogOut size={18} />
                    Disconnect
                </button>
            </div>
        </div>
    )
}