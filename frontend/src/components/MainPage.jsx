import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx'
import '../styles/MainPage.css'
import CreateProject from './CreateProject.jsx'
import LatestProject from './LatestProject.jsx'
import FABADDButton from './utils/FABAddButton.jsx';
import PanelView from './PanelView.jsx';
import { useEffect, useState } from 'react';
import {Outlet, useLocation} from 'react-router-dom';
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
        return (
            <div className="spinnerContainer">
                <div className="synthFlowSpinner"></div>
                <p className="spinnerLabel">Loading SynthFlow...</p>
            </div>
        );
    }
    return (
        <>
            <Navbar />   
            <main>
                <Sidebar isOpen={() => setIsOpen(true)} />

                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title='Create project'> 
                    <CreateProject />
                </Modal>
                <div className="dynamicPageContent">
                    <Outlet context={{ projects, setProjects}} />
                </div>

                <FABADDButton isOpen={() => setIsOpen(true)} />
            </main>
        </>
    );
}
