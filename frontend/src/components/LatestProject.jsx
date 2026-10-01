import { useEffect, useState } from 'react';
import '../styles/LatestProject.css';
import ProjectBoard from "./ProjectBoard.jsx";
import { useOutletContext } from 'react-router-dom';

export default function LatestProject() {
    const { projects, setProjects, onEditProject, setErrorMessage } = useOutletContext();
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Pierwsze pobranie dedykowanej listy ostatnich projektów z backendu
    useEffect(() => {
        const fetchRecentProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8000/api/projects/recent', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setRecentProjects(data);
                } else {
                    const errorData = await response.json();
                    if (setErrorMessage) setErrorMessage({ text: errorData.detail || "Failed to load recent projects", type: 'error' });
                }
            } catch (error) {
                console.error("Error fetching recent projects:", error);
                if (setErrorMessage) setErrorMessage({ text: "Connection error", type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchRecentProjects();
    }, [setErrorMessage]);

    // 2. KLUCZOWY KROK: Gdy zapiszesz edycję w modalu, zmieni się główny stan `projects` w kontekście.
    // Ten useEffect automatycznie podmieni zaktualizowane dane w `recentProjects` w czasie rzeczywistym!
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