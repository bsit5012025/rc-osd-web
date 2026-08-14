import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";
import AppealPage from "./pages/student/appeal/appealPage";



function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<LoginPage />}
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