import '../styles/Login.css'
import '../styles/share.css'

import fullLogo from '../assets/fullLogo.webp'
export default function Login(){
    const login = 'admin';
    const password = 'admin';

    return(
        <div className='userForm'>
            <img src={fullLogo} alt="Logo SynthFlow" />
            <p>Log in to continue</p>
            <form action="">
                <label htmlFor="">Login</label>
                <input type="text" />
                <label htmlFor="">Password</label>
                <input type='password' />
                <div>
                    <input type="checkbox" name="remember" id="" />
                    <p>Remember me</p>
                </div>
                <input className='button' type="submit" value="Log in" />
                <div>
                    <a href='#'>Create account</a>
                    <a href='#'>Reset password</a>
                </div>
            </form>
        </div>
    )
}