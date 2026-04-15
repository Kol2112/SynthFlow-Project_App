import { Link } from 'react-router-dom'

import '../styles/Login.css'
import '../styles/share.css'

import fullLogo from '../assets/fullLogo.webp'

export default function CreateAccount(){

    return(
        <main id='loginPage'>
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Create your account</h4>
                <form action="">
                    <div id='inputsContainer'>
                        <label htmlFor="">Email</label>
                        <input type="text" />
                        <label htmlFor="">Name</label>
                        <input type="text" />
                        <label htmlFor="">Surname</label>
                        <input type="text" />
                        <label htmlFor="">Password</label>
                        <input type='password' />
                    </div>
                    <div id='checkboxContainer'>
                        <input type="checkbox" name="remember" id="" /><span>Akceptuje regulamin</span>
                    </div>
                    <input id='actionButton' type="submit" value="Create account" />
                    <div className='actionLinks singleLink'>
                        <Link to='/'>Back to login</Link>
                    </div>
                </form>
            </div>
        </main>
    )
}