import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";
import AppealPage from "./pages/student/appeal/appealPage";
import DashboardPage from "./pages/student/dashboard/dashboardPage";
import ProfilePage from "./pages/student/profile/profilePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<LoginPage />}
                />
                
                <Route
                    path="/dashboard"
                    element={<DashboardPage />}
                />

                <Route
                    path="/profile"
                    element={<ProfilePage />}
                />

                <Route
                    path="/offenses"
                    element={<OffensesPage />}
                />

                <Route
                    path="/appeals"
                    element={<AppealPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;