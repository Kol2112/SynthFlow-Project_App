import '../styles/LatestProject.css'
import ProjectBoard from "./ProjectBoard.jsx";

export default function LatestProject({ projects, setProjects }) {

    const handleDelete = (deleteId) =>{
        setProjects(prevProjects => prevProjects.filter(project => project.id !== deleteId))
    }
    return (
        <div className="latestProjectContainer">
            {[...projects].reverse().map((project) => (
                <ProjectBoard 
                    key={project.id}
                    projectId={project.id}
                    projectKey={project.project_key}
                    projectTitle={project.name}
                    priority={project.priority}
                    complete={project.progress_prec}
                    date={project.deadline}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}