import Login from "./components/Login"
import MainPage from "./components/MainPage"
import RecoveryPage from "./components/RecoveryPage"
import CreateAccount from "./components/CreateAccount.jsx"
import ActivationPage from './components/ActivationPage';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Navigate } from 'react-router-dom';
function App() {
 const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};
  return(
    <>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<CreateAccount />} />
        <Route path='/recovery' element={<RecoveryPage />} />
        <Route path="/activate" element={<ActivationPage />} />
      <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } 
        /> 
      </Routes>
    </>

  )
}

export default App
