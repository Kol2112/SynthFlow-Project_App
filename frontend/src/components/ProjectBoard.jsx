import { FaRegCalendarDays } from "react-icons/fa6";
import '../styles/ProjectBoard.css'
import PriorityDots from "./PriorityDots";
export default function ProjectBoard({projectKey, projectTitle, members, complete, date, priority

    
}){
    return(
        <div className="projectBoardBody">
            <div className='projectBoardContent'>
                <p className="projectContentKey">SNF-50</p>
                <h3 className="projectContentTitle">SynthFlow</h3>
                <button className="meatball-btn" aria-label="Więcej opcji">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </button>
                <div className="projectContentMembers">
                    <p className='itemMember'>Members</p>
                    <p className='itemAvatar'>user</p>
                </div>
                <div className="projectContentPriority">
                    <p className='itemPriority'>Priority</p>
                    <PriorityDots />
                </div>
                <div className='projectContentComplete'>
                    <p className='itemComplete'>Complete: 56%</p>
                    <progress className='itemBar' value={56} max={100}></progress>
                </div>
                <div className="projectContentDate ">
                    <FaRegCalendarDays />
                    <p className="data">12-04-2026</p>
                </div>
            </div>
        </div>
    );
}