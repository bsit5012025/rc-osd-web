import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";
import AppealPage from "./pages/student/appeal/appealPage";
import FileAppealPage from "./pages/student/appeal/fileAppealPage";


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
                <Route
                    path="/appeals/file"
                    element={<FileAppealPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;