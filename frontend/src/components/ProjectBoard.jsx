import { FaRegCalendarDays } from "react-icons/fa6";
import '../styles/ProjectBoard.css'
import PriorityDots from "./PriorityDots";
export default function ProjectBoard({ projectKey, projectTitle, members, complete, date, priority }){
    const formattedDate = date ? new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "No deadline";
return (
        <div className="projectBoardBody">
            <div className='projectBoardContent'>
                <p className="projectContentKey">{projectKey}</p>
                <h3 className="projectContentTitle">{projectTitle}</h3>
                
                <button className="meatball-btn" aria-label="Więcej opcji">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </button>
                
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
                
                <div className="projectContentDate">
                    <FaRegCalendarDays />
                    <p className="data">{formattedDate}</p>
                </div>
            </div>
        </div>
    );
}