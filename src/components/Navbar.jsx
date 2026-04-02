import logo from '../assets/fullLogo.webp'
import profile from '../assets/settingIcon.svg'

import '../styles/Navbar.css'
export default function Navbar(){
    return(
        <nav>
            <img src={logo} alt='Logo'></img>
            <img src={profile} alt="" className='profile'/>
        </nav>
    )
}