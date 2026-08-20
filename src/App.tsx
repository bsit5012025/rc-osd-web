import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";
import AppealPage from "./pages/student/appeal/appealPage";
import DashboardPage from "./pages/student/dashboard/dashboardPage";
import ProfilePage from "./pages/student/profile/profilePage";
import FileAppealPage from "./pages/student/appeal/fileAppealPage";
import DeptHeadDashboardPage from "./pages/deptHead/dashboard/deptHeadDashboardPage";
import AppLayout from "./components/layout/AppLayout";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route element={<AppLayout />}>

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
                    <Route
                        path="/appeals/file"
                        element={<FileAppealPage />}
                    />

                </Route>

                <Route
                    path="/depthead/dashboard"
                    element={<DeptHeadDashboardPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;