// Sidebar.jsx
import { IoAddCircleOutline, IoArrowForward, IoArrowBack, IoAnalyticsOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function toggleSidebar() {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <aside className={`${isSidebarOpen ? 'open' : 'collapse'}`}>
            <ul>
                <li onClick={isOpen} style={{ cursor: 'pointer' }}>
                    <IoAddCircleOutline size={'3rem'} color={'#8B949E'} className="sidebarIcons" />  
                    <p>Add project</p>
                </li>
                <li>
                    <NavLink to="/projects" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%' }}>
                        <LuClipboardList size={'3rem'} color={'#8B949E'} className="sidebarIcons" />
                        <p>Projects</p>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/analytics" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%' }}>
                        <IoAnalyticsOutline size={'3rem'} color={'#8B949E'} className="sidebarIcons" />
                        <p>Analytics</p>
                    </NavLink>
                </li>
            </ul>

            {isSidebarOpen ? (
                <IoArrowBack className="arrow" onClick={toggleSidebar} style={{ cursor: 'pointer' }} />
            ) : (
                <IoArrowForward className="arrow" onClick={toggleSidebar} style={{ cursor: 'pointer' }} />
            )}
        </aside>
    );
}