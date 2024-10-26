// import { useState } from "react";
import NavBar from "./components/NavBar/NavBar";
import { Outlet } from "react-router-dom";

function App() {
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    );
}

export default App;
