
export default function Navbar() {
    return(
        <nav className="flex justify-evenly items-center">
            <h1 className="text-xl font-semibold">Decentralized Voting</h1>

            <ul className="flex items-center gap-8">
                <li><a href="/">Home</a></li>
                <li><a href="">About</a></li>
                <li><a href="">Features</a></li>
                <li><a href="">How to do</a></li>
                <li><a href="/login">Login</a></li>
            </ul>
        </nav>
    )
}