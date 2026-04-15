import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { MdOutlineAccountCircle } from "react-icons/md";
import logo from '../assets/fullLogo.webp'

import '../styles/Navbar.css'
export default function Navbar(){
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(()=>{
        const handleClickOutside = (event) =>{
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    },[])
    return(
        <nav>
            <img src={logo} alt='Logo' className="navEl"></img>
            <div className="dropdown" ref={dropdownRef}>
                <MdOutlineAccountCircle onClick={()=>setIsOpen(!isOpen)} size={'3rem'} color={'#8B949E'} className="navEl"/>
                {isOpen && (
                    <ul className="dropdownElementsContainer">
                        <li key={1}><Link to=''>Setting</Link></li>
                        <li key={2}><Link to='/'>Logout</Link></li>
                    </ul>
                )}
            </div>
        </nav>
    )
}