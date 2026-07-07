import '../styles/CreateProject.css';

export default function CreateTask({ taskForm, handleInputChange, handlePriorityChange, handleCreateTask }) {
    return (
        <form onSubmit={handleCreateTask} className="createProject" id="createTaskForm">
            <div className="leftColumn">
                <label>Task Name</label>
                <input 
                    type="text" 
                    name="name"
                    placeholder="e.g., Implementing Auth Logic" 
                    value={taskForm.name}
                    onChange={handleInputChange}
                    required
                    autoFocus
                />
                
                <label>Details</label>
                <textarea 
                    name="desc"
                    placeholder="Add core task description here..." 
                    value={taskForm.desc}
                    onChange={handleInputChange}
                    rows="10"
                    cols="30"
                />
            </div>

            <span id="halfLine"></span>

            <div className="rightColumn">
                <label>Deadline date</label>
                <input 
                    type="date" 
                    name="deadline"
                    value={taskForm.deadline}
                    onChange={handleInputChange}
                />

                <label>Task priority</label>
                <div className="projectPriorityButtons">
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                        <button 
                            key={p} 
                            type="button" 
                            className={taskForm.priority === p ? 'buttonActive' : ''} 
                            onClick={() => handlePriorityChange(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
        </form>
    );
}