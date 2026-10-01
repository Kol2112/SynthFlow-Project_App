import React from 'react';
import { useOutletContext } from 'react-router-dom';
import '../styles/Analytics.css';

export default function Analytics() {
    const { projects } = useOutletContext();

    const totalProjects = projects.length;
    
    const avgProgress = totalProjects > 0 
        ? Math.round(projects.reduce((acc, curr) => acc + (curr.progress_prec || 0), 0) / totalProjects) 
        : 0;

    const allTasks = projects.flatMap(p => p.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.progress_prec === 100).length;

    const priorityCounts = projects.reduce((acc, proj) => {
        const priority = proj.priority || 'Low';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
    }, { Low: 0, Medium: 0, High: 0, Critical: 0 });

    return (
        <div className="analyticsContainer">
            <h1 className="analyticsTitle">User Analytics Dashboard</h1>

            <div className="statsGrid">
                <div className="statCard">
                    <h3>Total Projects</h3>
                    <p className="statValue">{totalProjects}</p>
                </div>
                <div className="statCard">
                    <h3>Average Progress</h3>
                    <p className="statValue">{avgProgress}%</p>
                </div>
                <div className="statCard">
                    <h3>Total Tasks</h3>
                    <p className="statValue">{totalTasks}</p>
                </div>
                <div className="statCard">
                    <h3>Completed Tasks</h3>
                    <p className="statValue">{completedTasks}</p>
                </div>
            </div>

            <div className="analyticsDetailsGrid">
                <div className="analyticsCard">
                    <h2>Projects by Priority</h2>
                    <ul className="priorityList">
                        {Object.entries(priorityCounts).map(([priority, count]) => (
                            <li key={priority} className={`priorityItem ${priority.toLowerCase()}`}>
                                <span>{priority}</span>
                                <strong>{count}</strong>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="analyticsCard">
                    <h2>Projects Breakdown</h2>
                    <div className="projectProgressList">
                        {projects.length === 0 ? (
                            <p className="emptyText">No projects found for analytics.</p>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className="projectProgressItem">
                                    <div className="projectProgressHeader">
                                        <span>{project.name}</span>
                                        <span>{project.progress_prec || 0}%</span>
                                    </div>
                                    <div className="progressBarBg">
                                        <div className="progressBarFill" style={{ width: `${project.progress_prec || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}