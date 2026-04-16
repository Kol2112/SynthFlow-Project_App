import '../styles/LatestProject.css'
import ProjectBoard from "./ProjectBoard.jsx";

export default function LatestProject(){
    return(
        <>
            <h1>Latest Project</h1>
            <div className="latestProjectContainer">
                <ProjectBoard />
                <ProjectBoard />
                <ProjectBoard />
                <ProjectBoard />
            </div>
        </>
    )
}