import '../styles/LatestProject.css'
import ProjectBoard from "./ProjectBoard.jsx";

export default function LatestProject(){
    return(
            <div className="latestProjectContainer">
                <ProjectBoard />
                <ProjectBoard />
                <ProjectBoard />
                <ProjectBoard />
            </div>
    )
}