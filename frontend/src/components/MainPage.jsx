import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx'
import '../styles/MainPage.css'
import CreateProject from './CreateProject.jsx'
import LatestProject from './LatestProject.jsx'
import FABADDButton from './utils/FABAddButton.jsx';
import PanelView from './PanelView.jsx';
import { useEffect, useState } from 'react';
import EmptyDashboard from './emptyDashboard.jsx';
import ComingTasks from './ComingTasks.jsx';
import axios from 'axios';
export default function MainPage(){
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchProjects = async () =>{
            const token = localStorage.getItem('token');
            try{
                const response = await axios.get('http://localhost:8000/api/projects',{
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                });
                setProjects(response.data);
            }catch(err){
                console.error('Error occurred downloading projects:', err);
            }finally{
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);
    if (loading) {
        return <div style={{ color: 'white', textAlignment: 'center', marginTop: '20%' }}>Loading SynthFlow...</div>;
    }
    return(
        <>
            <Navbar/>   
            <main>
                <Sidebar isOpen={()=>setIsOpen(true)}/>

                <Modal isOpen={isOpen} onClose={()=>setIsOpen(false)} title='Create project'> 
                    <CreateProject />
                </Modal>
                {projects.length === 0 ? (
                    <EmptyDashboard />
                ): (
                    <div className='contentPanels'>
                        <PanelView headerTitle={'Latest Project'} content={<LatestProject projects={projects}/>}/>
                        {/* <PanelView headerTitle={'Upcoming Tasks'} content={<ComingTasks />}/> */}
                    </div> 
                )}

                <FABADDButton isOpen={()=>setIsOpen(true)}/>
            </main>
        </>
    )
}
