
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IssueManagement from "./pages/IssueManagement";
import Favorites from "./pages/Favorites";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard view="dashboard" />}
                    />

                    <Route
                        path="/my-books"
                        element={<Dashboard view="my-books" />}
                    />

                    <Route
                        path="/issues"
                        element={<IssueManagement />}
                    />

                    <Route
                        path="/favorites"
                        element={<Favorites />}
                    />

                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
