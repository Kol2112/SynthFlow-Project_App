import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../styles/Login.css'
import '../styles/share.css'

import { authService } from './utils/api';
import fullLogo from '../assets/fullLogo.webp'

import RecoveryPage from './RecoveryPage.jsx';
import ErrorMsg from './utils/ErrorMsg.jsx';

export default function Login(){
    const data = {
        email: '',
        password: '',
    }
    const [loginData, setLoginData] = useState(data);
    const [wrongLogin, setWrongLogin] = useState(false);
    const navigate = useNavigate();


    const handleChange = (e) =>{
        const {name, value} =e.target;
        setLoginData({
            ...loginData,
            [name]: value
        })
    }
    const handleLogin = async(e)=>{
        e.preventDefault();
        setWrongLogin('');

        try{
            const data = await authService.login(loginData);
            localStorage.setItem('token', data.access_token);

            navigate('/dashboard');
        }catch(err){
            if(err.response && err.response.data){
                setWrongLogin(err.response.data.detail);
            }else{
                setWrongLogin("Connection with server timeout")
            }
        }
    }

    
    


    

    return(
        <main id='loginPage'>
            {wrongLogin && <ErrorMsg errorMsg ={'Inserted login or password is incorrect!'} />}
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Log in to continue</h4>
                <form onSubmit={handleLogin}>
                    <div id='inputsContainer'>
                        <label htmlFor="">Login</label>
                        <input type="text" name="email" value={loginData.email} onChange={handleChange} placeholder='Email' required/>
                        <label htmlFor="">Password</label>
                        <input type='password' name="password" value={loginData.password} onChange={handleChange} placeholder='Password' required />
                    </div>
                    <div id='checkboxContainer'>
                        <input type="checkbox" name="remember" id=""/><span>Remember me</span>
                    </div>
                    <button id='actionButton' type="submit">Login</button>
                    <div className='actionLinks'>
                        <Link to='/register'>Create account</Link>
                        <Link to='/recovery'>Reset password</Link>
                    </div>
                </form>
            </div>

        </main>
    )
}