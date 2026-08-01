import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { FaRegCalendarDays } from "react-icons/fa6";

import PriorityDots from "./utils/PriorityDots.jsx";
import {useDeleteProject} from "./utils/helperFunctions.js";
import '../styles/ProjectBoard.css'
import '../styles/DropDown.css'

// 1. Dodajemy onEdit do propsów komponentu:
export default function ProjectBoard({ projectId, projectKey, projectTitle, members, complete, date, priority, onDelete, onEdit }){
    const [isOpen, setIsOpen] = useState(false);
    // 2. USUNIĘTO: const [onEdit, setIsEdit] = useState(false) <-- to blkowało działanie!
    
    const dropdownRef = useRef(null);
    const formattedDate = date ? new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "No deadline";
    const currentDate = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const deleteProject = useDeleteProject();

    useEffect(()=>{
        const handleClickOutside = (event) =>{
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    },[])

    const handleDelete = async (e) => {
        e.preventDefault();
        await deleteProject({
            projectId,
            onDeleteSuccess: (id) => {
                if (onDelete) {
                    onDelete(id);
                } else {
                    window.location.reload();
                }
            }
        });
    };

    return (
        <div className="projectBoardBody">
            <div className='projectBoardContent'>
                <p className="projectContentKey">{projectKey}</p>
                <h3 className="projectContentTitle">{projectTitle}</h3>
                
                <div className=" dropdown" ref={dropdownRef}>
                    <button className="meatball-btn" aria-label="More options" onClick={()=>setIsOpen(!isOpen)}>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </button>
                    {isOpen && (
                        <ul className="dropdownElementsContainer">
                            <li key={1}><Link to={`/project/${projectKey}`} className="dropdown-link">Details</Link></li>
                            <li key={2} onClick={() => { setIsOpen(false); if (onEdit) onEdit(projectId); }}>Edit</li>
                            <li key={3} onClick={handleDelete}><Link className="warning">Delete</Link></li>
                        </ul>
                    )}
                </div>

                <div className="projectContentMembers">
                    <p className='itemMember'>Members</p>
                    <p className='itemAvatar'>{members || "Only you"}</p>
                </div>
                
                <div className="projectContentPriority">
                    <p className='itemPriority'>Priority</p>
                    <PriorityDots priority={priority} />
                </div>
                
                <div className='projectContentComplete'>
                    <p className='itemComplete'>Complete: {complete || 0}%</p>
                    <progress className='itemBar' value={complete || 0} max={100}></progress>
                </div>

                <div className={"projectContentDate".concat(currentDate > formattedDate ? ' warning': '')}>
                    <FaRegCalendarDays />
                    <p className="data">{formattedDate}</p>
                </div>
            </div>
        </div>
    );
}