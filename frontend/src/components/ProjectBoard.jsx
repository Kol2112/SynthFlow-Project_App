import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { FaRegCalendarDays } from "react-icons/fa6";

import PriorityDots from "./utils/PriorityDots.jsx";
import ConfirmationModal from "./utils/ConfirmationModal.jsx";
import RenderAvatars from './utils/RenderAvatars.jsx';
import { useDeleteProject, isOverdue } from "./utils/helperFunctions.js";
import '../styles/ProjectBoard.css';
import '../styles/DropDown.css';

export default function ProjectBoard({ projectId, projectKey, projectTitle, members = [], complete, date, priority, onDelete, onEdit }) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
    const dropdownRef = useRef(null);
    const deleteProject = useDeleteProject();

    const formattedDate = date 
        ? new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
        : "No deadline";

    const overdue = isOverdue(date);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const confirmExecuteDeleteProject = async () => {
        try {
            await deleteProject({
                projectId,
                onDeleteSuccess: (id) => {
                    if (onDelete) onDelete(id);
                    else window.location.reload();
                }
            });
        } catch (error) {
            console.error("Error deleting project:", error);
        } finally {
            setConfirmDeleteProject(false);
        }
    };

    return (
        <div className="projectBoardBody">
            <div className='projectBoardContent'>
                <p className="projectContentKey">{projectKey}</p>
                <h3 className="projectContentTitle">{projectTitle}</h3>
                
                <div className="dropdown" ref={dropdownRef}>
                    <button className="meatball-btn" aria-label="More options" onClick={() => setIsOpen(!isOpen)}>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </button>
                    {isOpen && (
                        <ul className="dropdownElementsContainer">
                            <li key={1}><Link to={`/project/${projectKey}`} className="dropdown-link">Details</Link></li>
                            <li key={2} onClick={() => { setIsOpen(false); if (onEdit) onEdit(projectId); }}>Edit</li>
                            <li key={3} onClick={() => { setIsOpen(false); setConfirmDeleteProject(true); }}><Link className="warning">Delete</Link></li>
                        </ul>
                    )}
                </div>

                <div className="projectContentMembers">
                    <p className='itemMember'>Members</p>
                    <RenderAvatars members={members} maxCount={5} />
                </div>
                
                <div className="projectContentPriority">
                    <p className='itemPriority'>Priority</p>
                    <PriorityDots priority={priority} />
                </div>
                
                <div className='projectContentComplete'>
                    <p className='itemComplete'>Complete: {complete || 0}%</p>
                    <progress className='itemBar' value={complete || 0} max={100}></progress>
                </div>

                <div className={`projectContentDate ${overdue ? 'warning' : ''}`}>
                    <FaRegCalendarDays />
                    <p className="data">{formattedDate}</p>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmDeleteProject}
                onClose={() => setConfirmDeleteProject(false)}
                onConfirm={confirmExecuteDeleteProject}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                submitLabel="Delete Project"
                isDanger={true}
                formId="confirmDeleteProjectForm"
            />
        </div>
    );
}