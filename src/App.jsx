import Login from "./components/Login"
import MainPage from "./components/MainPage"
import RecoveryPage from "./components/RecoveryPage"
import CreateAccount from "./components/CreateAccount.jsx"
import { BrowserRouter, Route, Routes } from "react-router-dom"

function App() {
 
  return(
      <Routes>
        <Route path='/' element={<Login />} />
        
        <Route path='/register' element={<CreateAccount />} />
        <Route path='/recovery' element={<RecoveryPage />} />

        <Route path="/dashboard" element={<MainPage />} />
      </Routes>

  )
}

export default App
