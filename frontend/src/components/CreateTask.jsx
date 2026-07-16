import { useState } from 'react';
import '../styles/CreateProject.css';

export default function CreateTask({ taskForm, handleInputChange, handlePriorityChange, handleCreateTask, setTaskForm }) {
    const [subtaskName, setSubtaskName] = useState("");

    const addSubtask = () => {
        if(!subtaskName.trim()) return;

        const newSubtask = {
            id: 'temp-'+Date.now(),
            name: subtaskName.trim(),
            is_done: false
        }

        setTaskForm(prev => ({
            ...prev,
            subtasks: [...(prev.subtasks || []), newSubtask]
        }))
        setSubtaskName("");
    }
    const removeSubtask = (id) => {
        setTaskForm(prev => ({
            ...prev,
            subtasks: (prev.subtasks || []).filter(st => st.id !== id)
        }));
    };
    const toggleSubtask = (id) =>{
        setTaskForm(prev => ({
            ...prev,
            subtasks: (prev.subtasks || []).map(st => st.id === id ? { ...st, is_done: !st.is_done} : st)
        }));
    }

    return (
        <form onSubmit={handleCreateTask} className="createProject" id="createTaskForm">
            <div className="leftColumn">
                <label>Task Name</label>
                <input type="text" name="name"placeholder="e.g., Implementing Auth Logic" value={taskForm.name}onChange={handleInputChange}requiredautoFocus m/>
                
                <label>Details</label>
                <textarea name="desc"placeholder="Add core task description here..." value={taskForm.desc}onChange={handleInputChange}rows="10"cols="30"/>
            </div>

            <span id="halfLine"></span>

            <div className="rightColumn">
                <div className='taskDatesContainer'>
                    <div className='dateInputWrapper'>
                        <label>Start date</label>
                        <input type="date" name="startDate" value={taskForm.startDate || ""} onChange={handleInputChange} />
                    </div>
                    <div className='dateInputWrapper'>
                        <label>Deadline date</label>
                        <input type="date" name="deadline" value={taskForm.deadline || ""} onChange={handleInputChange} />
                    </div>
                </div>

                <label className='taskPriorityLabel'>Task priority</label>
                <div className="projectPriorityButtons">
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                        <button key={p} type="button"  className={taskForm.priority === p ? 'buttonActive' : ''} onClick={() => handlePriorityChange(p)}>
                            {p}
                        </button>
                    ))}
                </div>

                <label className='subtasksLabel'>Sub tasks</label>
                <div className='subtasksList'>
                    {(taskForm.subtasks || []).map((subtask) => (
                        <div key={subtask.id} className='subtaskItem'>
                            <div className='subtaskInnerWrapper'>
                                <input type="checkbox" checked={subtask.is_done} onChange={()=>toggleSubtask(subtask.id)} className='subtaskCheckbox' />
                                <span className={`subtaskText ${subtask.is_done ? 'subtaskCompleted' : ''}`}>
                                    {subtask.name}
                                </span>
                            </div>
                            <button type="button" onClick={()=> removeSubtask(subtask.id)} className='subtaskDeleteBtn'>✕</button>
                        </div>
                    ))}
                </div>

                <div className='addSubtaskContainer'>
                    <input type="text" placeholder='Add a subtask...' 
                        value={subtaskName} onChange={(e) => setSubtaskName(e.target.value)} 
                        className='addSubtaskInput' onKeyDown={(e) => {
                            if(e.key === "Enter"){ 
                                e.preventDefault(); 
                                addSubtask();
                            }
                        }}
                    />
                    <button type="button" onClick={addSubtask} className='addSubtaskBtn'>+</button>
                </div>
            </div>
        </form>
    );
}