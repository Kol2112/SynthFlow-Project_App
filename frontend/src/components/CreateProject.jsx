import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CreateProject.css';

export default function CreateProject({ onClose, projectForm, handleSubmit: externalSubmit, handleInputChange: externalInputChange, handlePriorityChange: externalPriorityChange }) {
    const [formData, setFormData] = useState({
        name: '',
        projectKey: '',
        desc: '',
        deadline: '',
        priority: 'Low',
        tags: '',
        githubRepo: ''
    });
    const [error, setError] = useState('');

    // Inicjalizacja stanu formData z przekazanego projectForm
    useEffect(() => {
        if (projectForm) {
            setFormData({
                name: projectForm.name || '',
                // Upewnijmy się, że obsłużymy zarówno camelCase jak i snake_case z API
                projectKey: projectForm.projectKey || projectForm.project_key || '',
                desc: projectForm.desc || '',
                deadline: projectForm.deadline ? projectForm.deadline.split('T')[0] : '',
                priority: projectForm.priority || 'Low',
                tags: projectForm.tags || '',
                githubRepo: projectForm.githubRepo || projectForm.github_repo || ''
            });
        }
    }, [projectForm]);

    const handleChange = (e) => {
        if (externalInputChange) {
            externalInputChange(e);
        }
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriorityChange = (newPriority) => {
        if (externalPriorityChange) {
            externalPriorityChange(newPriority);
        }
        setFormData(prev => ({
            ...prev,
            priority: newPriority
        }));
    };

    const handleSubmit = async (e) => {
        if (externalSubmit) {
            return externalSubmit(e);
        }

        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authorization denied. Please log in again.");
            return;
        }

        const isEdit = Boolean(projectForm && projectForm.id);
        const url = isEdit 
            ? `http://localhost:8000/api/projects/${projectForm.id}`
            : 'http://localhost:8000/api/projects';

        const payload = {
            name: formData.name,
            project_key: formData.projectKey,
            desc: formData.desc || null,
            priority: formData.priority,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            github_repo: formData.githubRepo || null
        };

        try {
            const response = isEdit 
                ? await axios.put(url, payload, { headers: { Authorization: `Bearer ${token}` } })
                : await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });

            console.log(isEdit ? 'Project updated:' : 'Project created:', response.data);

            if (onClose) onClose();
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.detail || "Something gone wrong");
        }
    };

    return (
        <form onSubmit={handleSubmit} className='createProject' id="universalForm">
            <div className="leftColumn">
                <label>Project Name</label>
                <input 
                    type="text" 
                    name="name" 
                    placeholder='e.g SynthFlow' 
                    value={formData.name} // <--- Odwołujemy się tylko do formData!
                    onChange={handleChange} 
                    required 
                />
                
                <label>Project Key</label>
                <input 
                    id="projKey" 
                    type="text" 
                    name="projectKey" 
                    placeholder='SNF-50' 
                    value={formData.projectKey} // <--- Odwołujemy się tylko do formData!
                    onChange={handleChange} 
                    disabled={Boolean(projectForm?.id || projectForm?.isEdit)} 
                    required 
                />
                
                <label>Details</label>
                <textarea 
                    name="desc" 
                    rows={"10"} 
                    cols={"30"} 
                    value={formData.desc} // <--- Odwołujemy się tylko do formData!
                    onChange={handleChange}
                ></textarea>
            </div>
            
            <span id="halfLine"></span>
            
            <div className="rightColumn">
                <label>Deadline date</label>
                <input 
                    type='date' 
                    name="deadline" 
                    value={formData.deadline} // <--- Odwołujemy się tylko do formData!
                    onChange={handleChange} 
                />
                
                <label>Project priority</label>
                <div className="projectPriorityButtons">
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                        <button 
                            key={p} 
                            type="button" 
                            className={formData.priority === p ? 'buttonActive' : ''} 
                            onClick={() => handlePriorityChange(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                
                <label>Tags</label>
                <input 
                    type="text" 
                    name="tags" 
                    placeholder="Please separate tags with ;" 
                    value={formData.tags} 
                    onChange={handleChange} 
                />
                
                <label>GitHub Repository</label>
                <input 
                    type="url" 
                    name="githubRepo" 
                    placeholder="https://github.com/username/repository" 
                    value={formData.githubRepo} // <--- Odwołujemy się tylko do formData!
                    onChange={handleChange} 
                />
            </div>
            {error && <p className="errorMessage">{error}</p>}
        </form>
    );
}