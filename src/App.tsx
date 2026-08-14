import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/student/login/loginPage";
import OffensesPage from "./pages/student/offense/OffensePage";



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

            </Routes>
        </BrowserRouter>
    );
}

export default App;