import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';

import Modal from './Modal.jsx';
import PanelView from './PanelView.jsx';
import CreateTask from './CreateTask.jsx';
import CreateProject from './CreateProject.jsx';
import ProjectDetailsModal from './ProjectDetailsModal.jsx'; // 1. IMPORT
import ProjectKanbanView from './ProjectKanbanView.jsx';
import ProjectListView from './ProjectListView.jsx';

import { useDeleteProject } from "./utils/helperFunctions.js";
import '../styles/ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
    const { projectKey: urlProjectKey } = useParams();
    
    const [projectName, setProjectName] = useState("");
    const [projectKey, setProjectKey] = useState(urlProjectKey || "");
    const [projectId, setProjectId] = useState(null);
    const [projectDesc, setProjectsDesc] = useState("");
    const [projectPriority, setProjectPriority] = useState("Low");
    const [projectDeadline, setProjectDeadline] = useState("");
    const [projectGithubRepo, setProjectGithubRepo] = useState("");
    
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // 2. NOWY STAN
    const [newListName, setNewListName] = useState("");

    const [activeColumnDropdown, setActiveColumnDropdown] = useState(null);
    const [activeTaskDropdown, setActiveTaskDropdown] = useState(null);

    const [renameListModal, setRenameListModal] = useState({
        isOpen: false,
        columnId: null,
        name: ""
    });

    const deleteProject = useDeleteProject();

    const [modalForm, setModalForm] = useState({
        isOpen: false,
        type: 'task',
        isEdit: false,
        columnId: null,
        id: null,
        name: "",
        desc: "",
        priority: "Low",
        startDate: "", 
        deadline: "",
        subtasks: []   
    });

    useEffect(() => {
        const savedViewMode = localStorage.getItem('project_view_mode');
        if (savedViewMode) {
            setViewMode(savedViewMode);
        }
    }, []);

    useEffect(() => {
        const fetchProjectAndColumns = async () => {
            try {
                setIsLoading(true);
                setColumns([]);
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/api/projects/by-key/${urlProjectKey}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch project details");
                }

                const data = await response.json();

                if (data && data.id) {
                    setProjectId(data.id);
                    setProjectName(data.name);
                    setProjectKey(data.project_key);
                    setProjectsDesc(data.desc || "");
                    setProjectPriority(data.priority || "Low");
                    setProjectDeadline(data.deadline || "");
                    setProjectGithubRepo(data.github_repo || data.githubRepo || "")

                    const normalizedColumns = (data.columns || []).map(col => ({
                        ...col,
                        tasks: (col.tasks || []).map(task => {
                            const taskProgress = task.progress_prec ?? task.progress ?? 0;
                            return {
                                ...task,
                                progress: taskProgress,
                                progress_prec: taskProgress,
                                subtasks: (task.subtasks || []).map(st => {
                                    const stProgress = st.progress_prec ?? (st.is_done ? 100 : 0);
                                    const isDone = stProgress === 100;

                                    return {
                                        ...st,
                                        progress_prec: stProgress,
                                        is_done: isDone,
                                        isCompleted: isDone
                                    };
                                })
                            };
                        })
                    }));

                    setColumns(normalizedColumns);
                } else {
                    throw new Error("Invalid data structure received from server");
                }
            } catch (error) {
                console.error("Error fetching columns:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (urlProjectKey) {
            fetchProjectAndColumns();
        }
    }, [urlProjectKey]);

    useEffect(() => {
        const handleOutsideClick = () => {
            setActiveColumnDropdown(null);
            setActiveTaskDropdown(null);
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    const openEditModal = (type, data={}, columnId = null) => {
        if(type === 'project'){
            setModalForm({
                isOpen: true,
                type: 'project',
                isEdit: true,
                id: projectId,
                columnId: null,
                name: projectName,
                desc: projectDesc,
                priority: projectPriority,
                startDate: "",
                deadline: projectDeadline ? projectDeadline.split('T')[0] : "",
                projectKey: projectKey,
                githubRepo: projectGithubRepo,
                subtasks: []
            });
        } else if(type === 'task'){
            let formattedDeadline = "";
            if (data.date && data.date !== "No deadline") {
                formattedDeadline = data.date.split('-').reverse().join('-');
            }
            setModalForm({
                isOpen: true,
                type: 'task',
                isEdit: true,
                columnId,
                id: data.id,
                name: data.name,
                desc: data.desc || "",
                priority: data.priority,
                startDate: data.startDate || "", 
                deadline: formattedDeadline,
                projectKey: "",
                subtasks: data.subtasks || []   
            });
        }
    };

    const openAddTaskModal = (columnId) => {
        setModalForm({
            isOpen: true,
            type: 'task',
            isEdit: false,
            columnId,
            id: null,
            name: "",
            desc: "",
            priority: "Low",
            startDate: "", 
            deadline: "",
            projectKey: "",
            subtasks: []   
        });
    };

    const closeModal = () => {
        setModalForm(prev => ({...prev, isOpen: false}));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setModalForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePriorityChange = (newPriority) => {
        setModalForm(prev => ({ ...prev, priority: newPriority }));
    };

    const handleToggleViewMode = () => {
        const nextMode = viewMode === 'kanban' ? 'list' : 'kanban';
        setViewMode(nextMode);
        localStorage.setItem('project_view_mode', nextMode);
    };

    const handleSaveForm = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const token = localStorage.getItem("token");

        if (modalForm.type === "project") {
            const payload = {
                name: modalForm.name,
                desc: modalForm.desc,
                priority: modalForm.priority,
                deadline: modalForm.deadline || null,
                github_repo: modalForm.githubRepo || modalForm.github_repo || null
            };

            try {
                const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Failed to update project");

                const updatedProject = await response.json();
                setProjectName(updatedProject.name);
                setProjectsDesc(updatedProject.desc || "");
                setProjectPriority(updatedProject.priority);
                setProjectDeadline(updatedProject.deadline ? updatedProject.deadline.split("T")[0] : "");
                setProjectGithubRepo(updatedProject.github_repo || updatedProject.githubRepo || "");

                closeModal();
            } catch (error) {
                console.error("Error updating project: ", error);
            }
        } else {
            if (!modalForm.name || !modalForm.name.trim() || !projectId || !modalForm.columnId) return;

            const url = modalForm.isEdit
                ? `http://localhost:8000/api/projects/${projectId}/columns/${modalForm.columnId}/tasks/${modalForm.id}` 
                : `http://localhost:8000/api/projects/${projectId}/columns/${modalForm.columnId}/tasks`;
            const method = modalForm.isEdit ? "PUT" : "POST";

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: modalForm.name,
                        desc: modalForm.desc,
                        priority: modalForm.priority,
                        start_date: modalForm.startDate || null,
                        deadline: modalForm.deadline || null,
                        subtasks: modalForm.subtasks || []
                    })
                });

                if (!response.ok) throw new Error("Failed to save task");

                const savedProjectDetails = await fetch(`http://localhost:8000/api/projects/by-key/${urlProjectKey}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (savedProjectDetails.ok) {
                    const data = await savedProjectDetails.json();
                    const normalizedColumns = (data.columns || []).map(col => ({
                        ...col,
                        tasks: (col.tasks || []).map(task => {
                            const taskProgress = task.progress_prec ?? task.progress ?? 0;
                            return {
                                ...task,
                                progress: taskProgress,
                                progress_prec: taskProgress,
                                subtasks: (task.subtasks || []).map(st => {
                                    const stProgress = st.progress_prec ?? (st.is_done ? 100 : 0);
                                    return {
                                        ...st,
                                        progress_prec: stProgress,
                                        is_done: stProgress === 100,
                                        isCompleted: stProgress === 100
                                    };
                                })
                            };
                        })
                    }));
                    setColumns(normalizedColumns);
                }

                closeModal();
            } catch (error) {
                console.error("Error creating or updating task: ", error);
            }
        }
    };

    const handleDeleteProject = async () => {
        deleteProject({ projectId, redirectTo: '/dashboard'});
    };

    const handleOnDragEnd = async (result) => {
        const { destination, source, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }
        if (type === "column") {
            const reorderedColumns = Array.from(columns);
            const [removed] = reorderedColumns.splice(source.index, 1);
            reorderedColumns.splice(destination.index, 0, removed);
            setColumns(reorderedColumns);
            return;
        }
        const sourceColId = parseInt(source.droppableId);
        const destColId = parseInt(destination.droppableId);
        const sourceCol = columns.find(col => col.id === sourceColId);
        const destCol = columns.find(col => col.id === destColId);
        
        if (!sourceCol || !destCol) return;
        const sourceTask = Array.from(sourceCol.tasks);
        const [movedTask] = sourceTask.splice(source.index, 1);
        if (sourceColId === destColId) {
            sourceTask.splice(destination.index, 0, movedTask);
            setColumns(columns.map(col => col.id === sourceColId ? { ...col, tasks: sourceTask } : col));
        } else {
            const destTasks = Array.from(destCol.tasks);
            destTasks.splice(destination.index, 0, movedTask);

            setColumns(columns.map(col => {
                if (col.id === sourceColId) return { ...col, tasks: sourceTask };
                if (col.id === destColId) return { ...col, tasks: destTasks };
                return col;
            }));

            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/api/tasks/${movedTask.id}/move?column_id=${destColId}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error("Failed to persist task movement in database");
                }
            } catch (error) {
                console.error("Error moving task: ", error);
            }
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim() || !projectId) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/columns`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newListName })
            });

            if (!response.ok) throw new Error("Failed to create column");

            const createdColumn = await response.json();
            const formattedColumn = { ...createdColumn, tasks: [] };

            setColumns([...columns, formattedColumn]);
            setNewListName("");
            setIsListModalOpen(false);
        } catch (error) {
            console.error("Error creating list on backend:", error);
        }
    };

    const handleRenameList = async (e) => {
        e.preventDefault();
        if (!renameListModal.name.trim() || !projectId || !renameListModal.columnId) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/columns/${renameListModal.columnId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: renameListModal.name })
            });
            if (!response.ok) throw new Error("Failed to rename list");

            setColumns(columns.map(col => col.id === renameListModal.columnId ? { ...col, name: renameListModal.name } : col));
            setRenameListModal({ isOpen: false, columnId: null, name: "" });
        } catch (error) {
            console.error("Error renaming list:", error);
        }
    };

    const handleDeleteList = async (columnId) => {
        if (!window.confirm("Are you sure you want to delete this list and all its tasks?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/columns/${columnId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to delete column");

            setColumns(columns.filter(col => col.id !== columnId));
        } catch (error) {
            console.error("Error deleting list:", error);
        }
    };

    const handleDeleteTask = async (columnId, taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/columns/${columnId}/tasks/${taskId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to delete task");

            setColumns(columns.map(col => {
                if (col.id === columnId) {
                    return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
                }
                return col;
            }));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleToggleAnyTask = async (columnId, taskId, isCurrentlyDone, parentTaskId = null) => {
        const nextDoneState = !isCurrentlyDone;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/toggle-complete`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_done: nextDoneState })
            });

            if (!response.ok) throw new Error(`Server status ${response.status}`);

            const data = await response.json();

            setColumns(prevColumns => (prevColumns || []).map(col => {
                if (col.id !== columnId) return col;

                return {
                    ...col,
                    tasks: (col.tasks || []).map(t => {
                        if (parentTaskId && t.id === parentTaskId) {
                            const updatedSubtasks = (t.subtasks || []).map(st => {
                                if (st.id === taskId) {
                                    return {
                                        ...st,
                                        is_done: nextDoneState,
                                        isCompleted: nextDoneState,
                                        progress_prec: nextDoneState ? 100 : 0,
                                        saved_progress: nextDoneState ? 100 : 0
                                    };
                                }
                                return st;
                            });

                            const completedCount = updatedSubtasks.filter(st => st.is_done || st.progress_prec === 100).length;
                            const calculatedProgress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : t.progress;
                            return {
                                ...t,
                                subtasks: updatedSubtasks,
                                progress: calculatedProgress,
                                progress_prec: calculatedProgress
                            };
                        }

                        if (!parentTaskId && t.id === taskId) {
                            const serverSubtasks = data.subtasks || [];
                            
                            const updatedSubtasks = (t.subtasks || []).map(existingSub => {
                                const match = serverSubtasks.find(s => s.id === existingSub.id);
                                if (match) {
                                    return {
                                        ...existingSub,
                                        is_done: match.is_done,
                                        isCompleted: match.is_done,
                                        progress_prec: match.progress_prec,
                                        saved_progress: match.saved_progress
                                    };
                                }
                                return existingSub;
                            });

                            return {
                                ...t,
                                progress: data.progress_prec,
                                progress_prec: data.progress_prec,
                                subtasks: updatedSubtasks
                            };
                        }

                        return t;
                    })
                };
            }));

        } catch (error) {
            console.error("Error toggling completion:", error);
            alert("Błąd połączenia z serwerem.");
        }
    };

    const renderMainContent = () => {
        if (isLoading) {
            return <div className="loading">Loading board...</div>;
        }

        if (viewMode === 'list') {
            return (
                <ProjectListView 
                    columns={columns} 
                    onToggleTaskComplete={(colId, taskId, isDone) => handleToggleAnyTask(colId, taskId, isDone, null)} 
                    onToggleSubtaskComplete={(colId, parentId, subId, isDone) => handleToggleAnyTask(colId, subId, isDone, parentId)} 
                    onOpenEditModal={(colId, task) => openEditModal('task', task, colId)}
                />
            );
        }

        return (
            <ProjectKanbanView 
                columns={columns}
                activeColumnDropdown={activeColumnDropdown}
                setActiveColumnDropdown={setActiveColumnDropdown}
                activeTaskDropdown={activeTaskDropdown}
                setActiveTaskDropdown={setActiveTaskDropdown}
                onOpenAddTaskModal={openAddTaskModal}
                onOpenEditTaskModal={(colId, task) => openEditModal('task', task, colId)}
                onDeleteList={handleDeleteList}
                onRenameListModal={(column) => setRenameListModal({ isOpen: true, columnId: column.id, name: column.name })}
                onDeleteTask={handleDeleteTask}
                onToggleTaskComplete={(colId, taskId, isDone) => handleToggleAnyTask(colId, taskId, isDone, null)}
                onOpenAddListModal={() => setIsListModalOpen(true)}
            />
        );
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <PanelView 
                headerTitle={projectName} 
                projectKey={projectKey} 
                content={renderMainContent()} 
                showViewToggle={columns.length > 0} 
                viewMode={viewMode} 
                onToggleView={handleToggleViewMode} 
                showSettings={true} 
                onEditProject={() => openEditModal('project')} 
                onDeleteProject={handleDeleteProject} 
                onAddList={() => setIsListModalOpen(true)}
                onShowDetails={() => setIsDetailsModalOpen(true)} // 3. PODŁĄCZENIE AKCJI "SHOW DETAILS"
            />

            <Modal 
                isOpen={modalForm.isOpen} 
                onClose={closeModal} 
                title={
                    modalForm.type === 'project' 
                        ? "Edit Project" 
                        : (modalForm.isEdit ? "Edit Task" : "Create New Task")
                } 
                formId="universalForm"
                submitLabel={modalForm.isEdit ? "Save Changes" : "Create"}
            >
                {modalForm.type === 'project' ? (
                    <CreateProject 
                        projectForm={modalForm} 
                        handleInputChange={handleInputChange} 
                        handlePriorityChange={handlePriorityChange} 
                        handleSubmit={handleSaveForm} 
                    />
                ) : (
                    <CreateTask 
                        taskForm={modalForm} 
                        handleInputChange={handleInputChange} 
                        handlePriorityChange={handlePriorityChange} 
                        handleCreateTask={handleSaveForm} 
                        setTaskForm={setModalForm} 
                    />
                )}
            </Modal>
            <Modal 
                isOpen={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
                title="Project Details"
                formId="projectDetailsForm"
                submitLabel="Close"
            >
                <ProjectDetailsModal 
                    name={projectName}
                    members={["only you"]}
                    tags={[]}
                    description={projectDesc}
                    githubRepo={projectGithubRepo}
                />
            </Modal>

            <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title="Create new list" formId="createListForm">
                <form id="createListForm" onSubmit={handleCreateList}>
                    <input type="text" placeholder="e.g., In Progress, QA, Blocked..." value={newListName} onChange={(e) => setNewListName(e.target.value)} autoFocus className="modalInput"/>
                </form>
            </Modal>

            <Modal isOpen={renameListModal.isOpen} onClose={() => setRenameListModal({ isOpen: false, columnId: null, name: "" })} title="Rename list" formId="renameListForm">
                <form id="renameListForm" onSubmit={handleRenameList}>
                    <input type="text" placeholder="List name..." value={renameListModal.name} onChange={(e) => setRenameListModal(prev => ({ ...prev, name: e.target.value }))} autoFocus className="modalInput" required/>
                </form>
            </Modal>
        </DragDropContext>
    );
}