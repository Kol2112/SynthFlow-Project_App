import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PanelView from './PanelView.jsx';
import ProjectBoard from './ProjectBoard.jsx';
import '../styles/LatestProject.css';

export default function AllProjects() {
    const { projects, setProjects, onEditProject } = useOutletContext();

    const handleDelete = (deleteId) => {
        setProjects(prevProjects => prevProjects.filter(project => project.id !== deleteId));
    };

    return (
        <PanelView 
            headerTitle={`All Projects`}
            content={
                <div className="latestProjectContainer">
                    {projects.map((project) => (
                        <ProjectBoard 
                            key={`${project.id}-${project.deadline}-${(project.members || []).length}`}
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
            }
        />
    );
}