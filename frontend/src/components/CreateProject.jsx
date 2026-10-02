import { useState, useEffect } from 'react';
import '../styles/CreateProject.css';
import UserPicker from './utils/UserPicker.jsx';
import { projectService } from './utils/api.js';
import { extractErrorMessage } from './utils/helperFunctions.js';

export default function CreateProject({ onClose, projectForm, handleSubmit: externalSubmit, handleInputChange: externalInputChange, handlePriorityChange: externalPriorityChange }) {
    const [formData, setFormData] = useState({
        name: '',
        projectKey: '',
        desc: '',
        deadline: '',
        priority: 'Low',
        tags: '',
        githubRepo: '',
        members: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (projectForm) {
            const initialMembers = projectForm.members || projectForm.project_members || projectForm.users || [];
            
            setFormData({
                name: projectForm.name || '',
                projectKey: projectForm.projectKey || projectForm.project_key || '',
                desc: projectForm.desc || '',
                deadline: projectForm.deadline ? projectForm.deadline.split('T')[0] : '',
                priority: projectForm.priority || 'Low',
                tags: projectForm.tags || '',
                githubRepo: projectForm.githubRepo || projectForm.github_repo || '',
                members: initialMembers
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

    const handleInviteUser = async (user) => {
        if (projectForm && projectForm.id) {
            try {
                await projectService.sendInvitation(projectForm.id, user.email);
            } catch (err) {
                setError(extractErrorMessage(err, "Error sending invitation"));
                return;
            }
        }
        setFormData(prev => ({ ...prev, members: [...prev.members, user] }));
    };

    const handleRemoveMember = async (userToRemove) => {
        if (projectForm && projectForm.id && userToRemove.id) {
            try {
                await projectService.removeMember(projectForm.id, userToRemove.id);
            } catch (err) {
                setError(extractErrorMessage(err, "Could not remove member"));
                return;
            }
        }
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter(m => m.email !== userToRemove.email)
        }));
    };

    const handleSubmit = async (e) => {
        if (externalSubmit) {
            return externalSubmit(e);
        }

        e.preventDefault();
        setError('');

        const isEdit = Boolean(projectForm && projectForm.id);

        const payload = {
            name: formData.name,
            project_key: formData.projectKey,
            desc: formData.desc || null,
            priority: formData.priority,
            deadline: formData.deadline ? formData.deadline : null,
            github_repo: formData.githubRepo || null
        };

        try {
            if (isEdit) {
                await projectService.updateProject(projectForm.id, payload);
            } else {
                await projectService.createProject(payload);
            }

            if (onClose) onClose();
            window.location.reload();
        } catch (err) {
            setError(extractErrorMessage(err, "Something went wrong"));
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
                    value={formData.name}
                    onChange={handleChange} 
                    required 
                />
                
                <label>Project Key</label>
                <input 
                    id="projKey" 
                    type="text" 
                    name="projectKey" 
                    placeholder='SNF-50' 
                    value={formData.projectKey}
                    onChange={handleChange} 
                    disabled={Boolean(projectForm?.id || projectForm?.isEdit)} 
                    required 
                />
                
                <UserPicker 
                    label="Invite members"
                    members={formData.members || []}
                    onAddMember={handleInviteUser}
                    onRemoveMember={handleRemoveMember}
                />

                <label>Details</label>
                <textarea 
                    name="desc" 
                    rows={"10"} 
                    cols={"30"} 
                    value={formData.desc}
                    onChange={handleChange}
                ></textarea>
            </div>
            
            <span id="halfLine"></span>
            
            <div className="rightColumn">
                <label>Deadline date</label>
                <input 
                    type='date' 
                    name="deadline" 
                    value={formData.deadline}
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
                    value={formData.githubRepo}
                    onChange={handleChange} 
                />
            </div>
            {error && <p className="errorMessage">{error}</p>}
        </form>
    );
}