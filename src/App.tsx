import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";
import AppealPage from "./pages/student/appeal/appealPage";
import DashboardPage from "./pages/student/dashboard/dashboardPage";
import ProfilePage from "./pages/student/profile/profilePage";
import FileAppealPage from "./pages/student/appeal/fileAppealPage";
import DeptHeadDashboardPage from "./pages/deptHead/dashboard/deptHeadDashboardPage";
import DeptHeadProfilePage from "./pages/deptHead/dashboard/profile/deptHeadProfilePage";
import AppLayout from "./components/layout/AppLayout";
import DeptHeadLayout from "./components/layout/DeptHeadLayout";


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

                <Route element={<DeptHeadLayout />}>

                    <Route
                        path="/depthead/dashboard"
                        element={<DeptHeadDashboardPage />}
                    />

                    <Route
                        path="/depthead/profile"
                        element={<DeptHeadProfilePage />}
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;