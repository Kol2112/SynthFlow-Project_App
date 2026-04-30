import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx'
import '../styles/MainPage.css'
import emptyDashboard from '../assets/emptyDashboard.svg'
import CreateProject from './CreateProject.jsx'
import LatestProject from './LatestProject.jsx'
import FABADDButton from './FABAddButton.jsx';
import { useState } from 'react';
export default function MainPage(){
    const [isOpen, setIsOpen] = useState(false)
//  Jeżeli document.width < 320px to aside wypierdala

    return(
        <>
            <Navbar/>   
            <main>
                <Sidebar isOpen={()=>setIsOpen(true)}/>
                <div id='mainContent'>
                    <img src={emptyDashboard} alt="" />
                    <h1>It's so empty, right now...</h1>
                    
                </div>

                <Modal isOpen={isOpen} onClose={()=>setIsOpen(false)} title='Create project'> 
                    <CreateProject />
                </Modal> 
                {/* <LatestProject /> */}
                <FABADDButton isOpen={()=>setIsOpen(true)}/>
            </main>
        </>
    )
}
