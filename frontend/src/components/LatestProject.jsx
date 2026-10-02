import { useEffect, useState } from 'react';
import '../styles/LatestProject.css';
import ProjectBoard from "./ProjectBoard.jsx";
import { useOutletContext } from 'react-router-dom';
import { projectService } from './utils/api.js';
import { extractErrorMessage } from './utils/helperFunctions.js';

export default function LatestProject() {
    const { projects, setProjects, onEditProject, setErrorMessage } = useOutletContext();
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentProjects = async () => {
            try {
                const data = await projectService.getRecentProjects();
                setRecentProjects(data);
            } catch (error) {
                console.error("Error fetching recent projects:", error);
                if (setErrorMessage) {
                    setErrorMessage({ 
                        text: extractErrorMessage(error, "Failed to load recent projects"), 
                        type: 'error' 
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRecentProjects();
    }, [setErrorMessage]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            setRecentProjects(prevRecent => 
                prevRecent.map(recentProj => {
                    const updated = projects.find(p => p.id === recentProj.id);
                    return updated ? updated : recentProj;
                })
            );
        }
    }, [projects]);

    const handleDelete = (deleteId) => {
        setRecentProjects(prev => prev.filter(p => p.id !== deleteId));
        setProjects(prev => prev.filter(p => p.id !== deleteId));
    };

    if (loading) return <div>Loading recent projects...</div>;

    return (
        <div className="latestProjectContainer">
            {recentProjects.map((project) => (
                <ProjectBoard 
                    key={`${project.id}-${project.deadline}-${project.priority}-${(project.members || []).length}`}
                    projectId={project.id}
                    projectKey={project.project_key}
                    projectTitle={project.name}
                    members={project.members}
                    priority={project.priority}
                    complete={project.progress_prec}
                    date={project.deadline}
                    onDelete={handleDelete}
                    onEdit={() => onEditProject && onEditProject(project)}
                />
            ))}
        </div>
    );
}