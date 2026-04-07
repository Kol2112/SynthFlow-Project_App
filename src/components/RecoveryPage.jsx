import { Link } from 'react-router-dom'

import '../styles/Login.css'
import '../styles/share.css'

import fullLogo from '../assets/fullLogo.webp'
export default function RecoveryPage(){

    return(
        <main id='loginPage'>
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Recover password</h4>
                <form action="">
                    <div id='inputsContainer'>
                        <label htmlFor="">Recover</label>
                        <input type="text" />
                    </div>
                    <input id='actionButton' type="submit" value="Recover" />
                    <div className='singleLink actionLinks '>
                        <Link to='/'>Back to login</Link>
                    </div>
                </form>
            </div>
        </main>
    )
}