import '../styles/LatestProject.css'
import ProjectBoard from "./ProjectBoard.jsx";

export default function LatestProject({ projects }) {
    if (!projects || projects.length === 0) {
        return <p style={{ color: '#8B949E' }}>No projects available.</p>;
    }

    return (
        <div className="latestProjectContainer">
            {[...projects].reverse().map((project) => (
                <ProjectBoard 
                    key={project.id}
                    projectKey={project.project_key}
                    projectTitle={project.name}
                    priority={project.priority}
                    complete={project.progress_prec}
                    date={project.deadline}
                />
            ))}
        </div>
    );
}