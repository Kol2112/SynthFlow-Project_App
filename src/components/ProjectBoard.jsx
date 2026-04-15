export default function ProjectBoard({projectKey, projectTitle, members, complete, date, priority

    
}){
    return(
        <div className="ProjectBoardBody">
            <p className="ProjectKey">SNF-50</p>
            <h3>SynthFlow</h3>
            <div className="">
                <p>Members</p>
                <p>user</p>
            </div>
            <div className="">
                <p>Complete: x%</p>

            </div>
            <div className="deadline">
                <p>calnedar</p>
                <p>date</p>
            </div>
        </div>
    );
}