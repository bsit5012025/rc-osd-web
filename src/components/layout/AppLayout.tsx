import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import "./AppLayout.css";

export default function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-layout-content">
                <Outlet />
            </div>
        </div>
    );
}