import { useOutletContext, useNavigate } from 'react-router-dom';
import PriorityDots from './utils/PriorityDots.jsx';
import RenderAvatars from './utils/RenderAvatars.jsx';
import '../styles/share.css'
import '../styles/ComingTasks.css';

export default function ComingTasks() {
    const { projects = [] } = useOutletContext();
    const navigate = useNavigate();

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcomingTasks = projects.flatMap(project => {
        const allTasks = project.tasks || (project.columns || []).flatMap(col => col.tasks || []);
        
        return allTasks.map(task => ({
            ...task,
            projectName: project.name,
            projectKey: project.project_key || project.projectKey
        }));
    }).filter(task => {
        if (!task.deadline) return false;
        const taskDeadline = new Date(task.deadline);
        return taskDeadline >= now && taskDeadline <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getTaskAssignees = (task) => {
        if (Array.isArray(task.assignees) && task.assignees.length > 0) return task.assignees;
        if (Array.isArray(task.members) && task.members.length > 0) return task.members;
        if (Array.isArray(task.users) && task.users.length > 0) return task.users;
        if (task.assignee) return [task.assignee];
        return [];
    };

    if (upcomingTasks.length === 0) {
        return (
            <div className="noUpcomingTasks">
                <p>No tasks with deadline in the upcoming 30 days.</p>
            </div>
        );
    }

    return (
        <section id="taskPanelContainer">
            <div id="taskPanelHeader">
                <span>Task</span>
                <span>Project</span>
                <span>Assignee</span>
                <span>Complete</span>
                <span>Priority</span>
                <span>Deadline</span>
                <span></span>
            </div>

            <div className="taskElementsList">
                {upcomingTasks.map((task, index) => {
                    const taskAssignees = getTaskAssignees(task);
                    const progress = task.progress_prec ?? task.progress ?? 0;

                    return (
                        <div className="taskElement" key={task.id || index}>
                            <p className="taskNameColumn">{task.name}</p>
                            <p className="projectNameColumn">{task.projectName}</p>
                            
                            <div className="assigneeColumn">
                                <RenderAvatars members={taskAssignees} maxCount={5} />
                            </div>

                            <span className="completeColumn">{progress}%</span>

                            <div className="priorityColumn">
                                <PriorityDots priority={task.priority || "Low"} />
                            </div>

                            <p className="deadlineColumn">{formatDate(task.deadline)}</p>

                            <div className="actionColumn">
                                <button className="detailsBtn" onClick={() => navigate(`/project/${task.projectKey}`)}>
                                    Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}