import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FaRegCalendarDays } from "react-icons/fa6";

import PriorityDots from "./utils/PriorityDots.jsx";
import '../styles/ProjectBoard.css'
import '../styles/DropDown.css'
export default function ProjectBoard({ projectKey, projectTitle, members, complete, date, priority }){
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const formattedDate = date ? new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "No deadline";
    const currentDate = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

    useEffect(()=>{
        const handleClickOutside = (event) =>{
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    },[])
return (
        <div className="projectBoardBody">
            <div className='projectBoardContent'>
                <p className="projectContentKey">{projectKey}</p>
                <h3 className="projectContentTitle">{projectTitle}</h3>
                
                <div className=" dropdown" ref={dropdownRef}>
                    <button className="meatball-btn" aria-label="Więcej opcji" onClick={()=>setIsOpen(!isOpen)}>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>

                    </button>
                    {isOpen && (
                            <ul className="dropdownElementsContainer">
                                <li key={1}><Link to={`/project/${projectKey}`} className="dropdown-link">Tasks</Link></li>
                                <li key={2}>Edit</li>
                                <li key={3}>Delete</li>
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

                <div className={"projectContentDate".concat(currentDate > formattedDate ? ' dateGone': '')}>
                    <FaRegCalendarDays />
                    <p className="data">{formattedDate}</p>
                </div>
            </div>
        </div>
    );
}