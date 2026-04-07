import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx'
import '../styles/MainPage.css'
import emptyDashboard from '../assets/emptyDashboard.svg'
import { useState } from 'react';
import CreateProject from './CreateProject.jsx'
export default function MainPage(){
    const [isCreateOpen, setCreateOpen] = useState(true);
    return(
        <>
            <Navbar />
            <main>
                {/* <Sidebar />
                <div id='mainContent'>
                    <img src={emptyDashboard} alt="" />
                    <h1>It's so empty, right now...</h1>
                </div> */}

                <Modal isOpen={isCreateOpen} onClose={() =>setCreateOpen(false)} title='Dodaj projekt'> 
                    <CreateProject />
                </Modal>
            </main>
        </>
    )
}