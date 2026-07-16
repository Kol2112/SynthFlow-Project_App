import { useOutletContext } from 'react-router-dom';
import PanelView from '..//PanelView.jsx';
import LatestProject from '../LatestProject.jsx';
import EmptyDashboard from '../emptyDashboard.jsx';

export default function DashboardHome() {
    const { projects, setProjects } = useOutletContext();

    if (projects.length === 0) {
        return <EmptyDashboard />;
    }

    return (
        <div className='contentPanels'>
            <PanelView headerTitle={'Latest Project'} content={<LatestProject projects={projects} setProjects={setProjects} />} />
        </div>
    );
}