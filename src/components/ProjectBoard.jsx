import '../styles/ProjectBoard.css'
export default function ProjectBoard({projectKey, projectTitle, members, complete, date, priority

    
}){
    return(
        <div className="projectBoardBody">
            <p className="projectKey">SNF-50</p>
            <h3 className="projectTitle">SynthFlow</h3>
            <div className="projectMembers">
                <p>Members</p>
                <p>user</p>
            </div>
            <div className="projectPriority">
                <p>Complete: x%</p>

            </div>
            <div className="dateEnd">
                <p>calnedar</p>
                <p>12-04-2026</p>
            </div>
        </div>
    );
}