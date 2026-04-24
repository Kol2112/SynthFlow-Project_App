import '../styles/LatestProject.css'
import ProjectBoard from "./ProjectBoard.jsx";

export default function LatestProject(){
    return(
        <section className='latestProject'>
            <div id='headerSection'>
                <h1>Latest Project</h1>
                <div id='horizontalLine'></div>
            </div>
            <div className="latestProjectContainer">
                <ProjectBoard />
                <ProjectBoard />
                <ProjectBoard />
                <ProjectBoard />
            </div>
        </section>
    )
}