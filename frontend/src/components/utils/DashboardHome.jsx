import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PanelView from '../PanelView.jsx';
import LatestProject from '../LatestProject.jsx';
import ComingTasks from '../ComingTasks.jsx';
import EmptyDashboard from '../EmptyDashboard.jsx';
import '../../styles/share.css';

export default function DashboardHome() {
    const { projects, setProjects } = useOutletContext();

    if (projects.length === 0) {
        return <EmptyDashboard />;
    }

    return (
        <div className='dashboardContentPanels'>
            <PanelView 
                headerTitle={'Latest Project'} 
                content={<LatestProject projects={projects} setProjects={setProjects} />} 
            />

            <PanelView 
                headerTitle={'Upcoming tasks'} 
                content={<ComingTasks/>} 
            />
        </div>
    );
}
