import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Modal from './Modal.jsx';
import '../styles/MainPage.css';
import CreateProject from './CreateProject.jsx';
import FABADDButton from './utils/FABAddButton.jsx';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function MainPage(){
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalForm, setModalForm] = useState({
        isEdit: false,
        id: null,
        name: '',
        projectKey: '',
        desc: '',
        deadline: '',
        priority: 'Low'
    });

    const location = useLocation();

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8000/api/projects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjects(response.data);
            } catch (err) {
                console.error('Error occurred downloading projects:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [location.pathname]);

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
            githubRepo: project.github_repo || project.githubRepo || ''
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
        const token = localStorage.getItem('token');

        if (modalForm.isEdit) {
            const payload = {
                name: modalForm.name,
                desc: modalForm.desc,
                priority: modalForm.priority,
                deadline: modalForm.deadline || null,
                github_repo: modalForm.githubRepo || null
            };

            try {
                const response = await axios.put(`http://localhost:8000/api/projects/${modalForm.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProjects(prev => prev.map(p => p.id === modalForm.id ? { ...p, ...response.data } : p));
                setIsOpen(false);
            } catch (err) {
                console.error("Error updating project:", err);
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
            <main>
                <Sidebar isOpen={handleOpenCreateModal} />

                <Modal 
                    isOpen={isOpen} 
                    onClose={() => setIsOpen(false)} 
                    title={modalForm.isEdit ? 'Edit Project' : 'Create Project'}
                    formId="universalForm"
                    submitLabel={modalForm.isEdit ? 'Save Changes' : 'Create'}
                > 
                    <CreateProject 
                        projectForm={modalForm.isEdit ? modalForm : null}
                        handleInputChange={handleInputChange}
                        handlePriorityChange={handlePriorityChange}
                        handleSubmit={handleSaveProject}
                        onClose={() => setIsOpen(false)}
                    />
                </Modal>

                <div className="dynamicPageContent">
                    <Outlet context={{ projects, setProjects, onEditProject: handleOpenEditModal }} />
                </div>

                <FABADDButton isOpen={handleOpenCreateModal} />
            </main>
        </>
    );
}