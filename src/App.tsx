import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";
import AppealPage from "./pages/student/appeal/appealPage";
import ProfilePage from "./pages/student/profile/profilePage";

import DeptHeadDashboardPage from "./pages/deptHead/dashboard/deptHeadDashboardPage";
import DeptHeadProfilePage from "./pages/deptHead/profile/deptHeadProfilePage";
import DeptHeadRequestPage from "./pages/deptHead/request/deptHeadRequestPage";
import AdminDashboardPage from "./pages/admin/dashboard/adminDashboardPage";
import AppLayout from "./components/layout/AppLayout";
import DeptHeadLayout from "./components/layout/DeptHeadLayout";
import AdminLayout from "./components/layout/AdminLayout";
{/* import ProtectedRoute from "./components/routing/ProtectedRoute";*/}


function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Login */}
                <Route
                    path="/login"
                    element={<LoginPage />}
                />


                {/* 
                <Route 
                    element={ 
                        <ProtectedRoute> 
                            <AppLayout /> 
                        </ProtectedRoute> 
                    } 
                >
                */}

                {/* Student Routes */}
                <Route element={<AppLayout />}>

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

                </Route>


                {/* 
                <Route 
                    element={ 
                        <ProtectedRoute> 
                            <DeptHeadLayout /> 
                        </ProtectedRoute> 
                    } 
                >
                */}

                {/* Department Head Routes */}
                <Route element={<DeptHeadLayout />}>

                    <Route
                        path="/depthead/dashboard"
                        element={<DeptHeadDashboardPage />}
                    />

                    <Route
                        path="/depthead/profile"
                        element={<DeptHeadProfilePage />}
                    />

                    <Route
                        path="/depthead/requests"
                        element={<DeptHeadRequestPage />}
                    />

                </Route>


                {/* Admin Routes */}
                <Route element={<AdminLayout />}>

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboardPage />}
                    />

                </Route>


                {/* Default Routes */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;