import { useState } from 'react';
import axios from 'axios';
import '../styles/CreateProject.css';
export default function CreateProject({onClose}){
    const [formData, setFormData] = useState({
        name:'',
        projectKey:'',
        desc:'',
        deadline:'',
        priority:'Low',
        tags:''
    });
    const [error, setError] = useState('');
    
    const handleChange = (e) => {
        const {name, value} = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
    };

    const handlePriorityChange = (newPriority)=>{
        setFormData(prev=>({
            ...prev,
            priority: newPriority
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');
        if(!token){
            setError("Authorization denied. Please log in again.")
        }
        const paylaod = {
            name: formData.name,
            project_key: formData.projectKey,
            desc: formData.desc || null,
            priority: formData.priority,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            github_repo: null
        };
        try{
            const response = await axios.post('http://localhost:8000/api/projects', paylaod, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Project created:', response.data);

            if(onClose) onClose();
            window.location.reload();
        }
        catch(err){
            setError(err.response?.data?.detail || "Something gone wrong")
        }
    };
    return(
            <form onSubmit={handleSubmit} className='createProject' id="createProjectForm">
                <div className="leftColumn">
                    <label>Project Name</label>
                    <input type="text" name="name" placeholder='e.g SynthFlow' value={formData.name} onChange={handleChange} required/>
                    <label>Project Key</label>
                    <input id="projKey" type="text" name="projectKey" placeholder='SNF-50' value={formData.projectKey} onChange={handleChange} required/>
                    <label>Details</label>
                    <textarea name="desc" rows= {"10"} cols={"30"} value={formData.desc} onChange={handleChange}></textarea>
                </div>
                <span id="halfLine"></span>
                <div className="rightColumn">
                    <label>Deadline date</label>
                    <input type='date' name="deadline" value={formData.deadline} onChange={handleChange}/>
                    <label>Add members</label>
                    <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 -960 960 960" width="2rem" fill="#8B949E" ><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                    <label>Project priority</label>
                    <div className="projectPriorityButtons">
                        {['Low', 'Medium', 'High', 'Critical'].map((p)=>(
                            <button key={p} type="button" className={formData.priority === p ? 'buttonActive': ''} onClick={()=>handlePriorityChange(p)}>{p}</button>
                        ))}
                    </div>
                    <label>Tags</label>
                    <input type="text" name="tags" placeholder="Please seperate tags with ;" value={formData.tags} onChange={handleChange}/>
                </div>


            </form>
    )
}