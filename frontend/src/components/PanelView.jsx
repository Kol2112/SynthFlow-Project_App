import { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline, IoListOutline, IoGridOutline } from "react-icons/io5";
import '../styles/PanelView.css';

export default function PanelView({ headerTitle, projectKey, content, showViewToggle = false, showSettings = false, viewMode = "Kanban", onToggleView, onEditProject, onAddList, onShowDetails, onDeleteProject}) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <section className='panelViewContainer'>
            <div id='headerSection'>
                <div className="headerTopRow">
                    <div className="headerTitleGroup">
                        <h1>{headerTitle}</h1>
                        {projectKey && <span className="headerProjectKey">{projectKey}</span>}
                    </div>
                    
                    <div className="headerActionsControls">
                        {showViewToggle && (
                            <button className="headerViewToggleBtn" aria-label="Toggle view design" onClick={onToggleView} title ={viewMode === "Kanban" ? "Switch to list viwe" : "Switch to kanban view"}>
                                {viewMode === "kanban" ? <IoListOutline /> : <IoGridOutline/>}
                            </button>
                        )}
                        
                        {showSettings && (
                            <div className="settingsDropdownContainer" ref={settingsRef}>
                                <button 
                                    className="headerSettingsBtn" 
                                    aria-label="Project settings" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSettingsOpen(!isSettingsOpen);
                                    }}
                                >
                                    <IoSettingsOutline />
                                </button>
                                {isSettingsOpen && (
                                    <ul className="panelSettingsMenu">
                                        <li onClick={() => { setIsSettingsOpen(false); onEditProject(); }}>Edit</li>
                                        <li onClick={() => { setIsSettingsOpen(false); onAddList(); }}>Add list</li>
                                        <li onClick={() => { setIsSettingsOpen(false); onShowDetails(); }}>Show details</li>
                                        <li className="dangerAction" onClick={() => { setIsSettingsOpen(false); onDeleteProject(); }}>Delete project</li>
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div id='horizontalLine'></div>
            </div>
            <div className="panelViewMainContent">
                {content}
            </div>
        </section>
    );
}