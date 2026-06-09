import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx'
import '../styles/MainPage.css'
import CreateProject from './CreateProject.jsx'
import LatestProject from './LatestProject.jsx'
import FABADDButton from './FABAddButton.jsx';
import PanelView from './PanelView.jsx';
import { useState } from 'react';
import EmptyDashboard from './emptyDashboard.jsx';
import ComingTasks from './ComingTasks.jsx';
export default function MainPage(){
    const [isOpen, setIsOpen] = useState(false)

    return(
        <>
            <Navbar/>   
            <main>
                <Sidebar isOpen={()=>setIsOpen(true)}/>

                <EmptyDashboard />
                <Modal isOpen={isOpen} onClose={()=>setIsOpen(false)} title='Create project'> 
                    <CreateProject />
                </Modal>
                {/* <div className='contentPanels'>
                    <PanelView headerTitle={'Latest Project'} content={<LatestProject />}/>
                    <PanelView headerTitle={'Upcoming Tasks'} content={<ComingTasks />}/>
                </div>  */}
                <FABADDButton isOpen={()=>setIsOpen(true)}/>
            </main>
        </>
    )
}
