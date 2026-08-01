import Login from "./components/Login.jsx"
import MainPage from "./components/MainPage.jsx"
import DashboardHome from "./components/utils/DashboardHome.jsx" 
import RecoveryPage from "./components/RecoveryPage.jsx"
import CreateAccount from "./components/CreateAccount.jsx"
import ActivationPage from './components/ActivationPage';
import ProjectDetailsPage from "./components/ProjectDetailsPage.jsx";
import Account from "./components/Account.jsx"
import Settings from "./components/Settings.jsx"; // <--- 1. IMPORT
import ConfirmChange from "./components/utils/ConfirmChange.jsx"
import { Route, Routes, Navigate } from "react-router-dom"

function App() {
    const ProtectedRoute = ({ children }) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    const PublicOnlyRoute = ({children}) =>{
        const token = localStorage.getItem('token');
        if(token){
            return <Navigate to="/dashboard" replace/>;
        }
        return children;
    }

    return (
        <Routes>
            <Route path='/' element={
                <PublicOnlyRoute>
                    <Login />
                </PublicOnlyRoute>
            } />
            
            <Route path='/login' element={
                <PublicOnlyRoute>
                    <Login />
                </PublicOnlyRoute>
            } />

            <Route path='/register' element={<PublicOnlyRoute><CreateAccount /></PublicOnlyRoute>} />
            <Route path='/recovery' element={<PublicOnlyRoute><RecoveryPage /></PublicOnlyRoute>} />
            <Route path="/activate" element={<PublicOnlyRoute><ActivationPage /></PublicOnlyRoute>} />
            
            <Route path="/confirm-change" element={<ConfirmChange />} />
            
            <Route element={
                <ProtectedRoute>
                    <MainPage />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/account" element={<Account />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="project/:projectKey" element={<ProjectDetailsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App