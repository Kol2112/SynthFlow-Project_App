import '../styles/Login.css'
import '../styles/share.css'
import RecoveryPage from './RecoveryPage';
import { Link, useNavigate } from 'react-router-dom';

import fullLogo from '../assets/fullLogo.webp'
import { useEffect, useRef, useState } from 'react';

export default function Login(){

    const [wrongLogin, setWrongLogin] = useState(false);
    
    const navigate = useNavigate();
    
    const Login = useRef('Admin');
    const Password = useRef('Admin');
    function handleLogin(event){
        event.preventDefault();
        Login.current.value === 'Admin' && Password.current.value==='Admin' ? navigate('/dashboard') : setWrongLogin(true);
    }

    useEffect(()=>{
        let timer;
        if(wrongLogin){
            timer = setTimeout(()=>{
                setWrongLogin(false);
            },2000)
        }

        return ()=>clearTimeout(timer);
    },[wrongLogin])

    return(
        <main id='loginPage'>
            {wrongLogin && (<div className='wrongDataContainer'><p className='wrongDataEl'>Inserted login or password is inccorect!</p></div>)}
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Log in to continue</h4>
                <form action="">
                    <div id='inputsContainer'>
                        <label htmlFor="">Login</label>
                        <input type="text" ref={Login}/>
                        <label htmlFor="">Password</label>
                        <input type='password' ref={Password} />
                    </div>
                    <div id='checkboxContainer'>
                        <input type="checkbox" name="remember" id=""/><span>Remember me</span>
                    </div>
                    <input id='actionButton' type="submit" value="Log in" onClick={handleLogin}/>
                    <div className='actionLinks'>
                        <Link to='/register'>Create account</Link>
                        <Link to='/recovery'>Reset password</Link>
                    </div>
                </form>
            </div>

        </main>
    )
}