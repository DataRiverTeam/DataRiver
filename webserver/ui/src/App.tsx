import NavBar from "./components/NavBar/NavBar";
import { Outlet } from "react-router-dom";

function App() {
    return (
        <div className="content">
            <NavBar />
            <Outlet />
        </div>
    );
}

export default App;
