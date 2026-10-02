import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx';
import CreateProject from './CreateProject.jsx';
import ErrorMsg from './utils/ErrorMsg.jsx';

import '../styles/MainPage.css';

import useAutoRefreshAuth from './utils/useAutoRefreshAuth.js';
import { projectService } from './utils/api.js';
import { extractErrorMessage } from './utils/helperFunctions.js';

export default function MainPage(){
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const [modalForm, setModalForm] = useState({
        isEdit: false,
        id: null,
        name: '',
        projectKey: '',
        desc: '',
        deadline: '',
        priority: 'Low',
        members: []
    });

    useAutoRefreshAuth();
    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/', { replace: true });
                return;
            }
            try {
                const data = await projectService.getProjects();
                setProjects(data);
            } catch (err) {
                console.error('Error occurred downloading projects:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    navigate('/', { replace: true });
                } else {
                    setErrorMessage(extractErrorMessage(err, "Failed to load projects"));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [location.pathname, navigate]);

    const handleOpenCreateModal = () => {
        setModalForm({
            isEdit: false,
            id: null,
            name: '',
            projectKey: '',
            desc: '',
            deadline: '',
            priority: 'Low'
        });
        setIsOpen(true);
    };

    const handleOpenEditModal = (project) => {
        setModalForm({
            isEdit: true,
            id: project.id,
            name: project.name,
            projectKey: project.project_key || project.projectKey,
            desc: project.desc || '',
            deadline: project.deadline ? project.deadline.split('T')[0] : '',
            priority: project.priority || 'Medium',
            githubRepo: project.github_repo || project.githubRepo || '',
            members: project.members || []
        });
        setIsOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setModalForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePriorityChange = (newPriority) => {
        setModalForm(prev => ({ ...prev, priority: newPriority }));
    };

    const handleSaveProject = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (modalForm.isEdit) {
            const payload = {
                name: modalForm.name,
                desc: modalForm.desc,
                priority: modalForm.priority,
                deadline: modalForm.deadline || null,
                github_repo: modalForm.githubRepo || null
            };

            try {
                const updatedData = await projectService.updateProject(modalForm.id, payload);
                setProjects(prev => prev.map(p => p.id === modalForm.id ? { ...p, ...updatedData } : p));
                setIsOpen(false);
            } catch (err) {
                console.error("Error updating project:", err);
                const msg = extractErrorMessage(err, "Failed to update project");
                setErrorMessage(msg);
            }
        } else {
            const payload = {
                name: modalForm.name,
                project_key: modalForm.projectKey,
                desc: modalForm.desc || null,
                priority: modalForm.priority,
                deadline: modalForm.deadline || null,
                github_repo: modalForm.githubRepo || null
            };

            try {
                const newData = await projectService.createProject(payload);
                setProjects(prev => [...prev, newData]);
                setIsOpen(false);
            } catch (err) {
                console.error("Error creating project:", err);
                const msg = extractErrorMessage(err, "Failed to process project request");
                setErrorMessage(msg);
            }
        }
    };

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
            {errorMessage && <ErrorMsg errorMsg={errorMessage} />}
            <main>
                <Sidebar isOpen={handleOpenCreateModal} />

                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={modalForm.isEdit ? 'Edit Project' : 'Create Project'} formId="universalForm" submitLabel={modalForm.isEdit ? 'Save Changes' : 'Create'}
                > 
                    <CreateProject projectForm={modalForm.isEdit ? modalForm : null} handleInputChange={handleInputChange} handlePriorityChange={handlePriorityChange} handleSubmit={handleSaveProject} onClose={() => setIsOpen(false)}
                    />
                </Modal>

                <div className="dynamicPageContent">
                    <Outlet context={{ projects, setProjects, onEditProject: handleOpenEditModal, setErrorMessage }} />
                </div>
            </main>
        </>
    );
}