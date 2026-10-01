import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';

import Modal from './Modal.jsx';
import ConfirmationModal from './utils/ConfirmationModal.jsx'
import PanelView from './PanelView.jsx';
import CreateTask from './CreateTask.jsx';
import CreateProject from './CreateProject.jsx';
import ProjectDetailsModal from './ProjectDetailsModal.jsx';
import ProjectKanbanView from './ProjectKanbanView.jsx';
import ProjectListView from './ProjectListView.jsx';
import { useDeleteProject, useDeleteTask, useDeleteColumn } from "./utils/helperFunctions.js";
import '../styles/ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
    const { projectKey: urlProjectKey } = useParams();
    const { setErrorMessage } = useOutletContext();

    const [isOwner, setIsOwner] = useState(false);
    const [projectOwnerId, setProjectOwnerId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [projectName, setProjectName] = useState("");
    const [projectKey, setProjectKey] = useState(urlProjectKey || "");
    const [projectId, setProjectId] = useState(null);
    const [projectDesc, setProjectsDesc] = useState("");
    const [projectMembers, setProjectMembers] = useState([]);
    const [projectPriority, setProjectPriority] = useState("Low");
    const [projectDeadline, setProjectDeadline] = useState("");
    const [projectGithubRepo, setProjectGithubRepo] = useState("");
    
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [activeColumnDropdown, setActiveColumnDropdown] = useState(null);
    const [activeTaskDropdown, setActiveTaskDropdown] = useState(null);

    const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
    const [confirmDeleteList, setConfirmDeleteList] = useState({ isOpen: false, columnId: null });
    const [confirmDeleteTask, setConfirmDeleteTask] = useState({ isOpen: false, columnId: null, taskId: null });

    const [renameListModal, setRenameListModal] = useState({
        isOpen: false,
        columnId: null,
        name: ""
    });

    const navigate = useNavigate();
    const deleteProject = useDeleteProject();
    const deleteTask = useDeleteTask();
    const deleteColumn = useDeleteColumn();

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
        subtasks: [],
        assignees: []
    });

    useEffect(() => {
        const fetchProjectAndColumns = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");
                setColumns([]);
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/api/projects/by-key/${urlProjectKey}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    if(response.status === 404){
                        setErrorMessage("This project doesn't exist");
                        navigate('/dashboard', {replace: true});
                    }else{
                        setErrorMessage("An error occurred while loading data");
                    }
                    return;
                }

                const data = await response.json();

                if (data && data.id) {
                    setProjectId(data.id);
                    setProjectOwnerId(data.owner_id);
                    setProjectName(data.name);
                    setProjectKey(data.project_key);
                    setProjectsDesc(data.desc || "");
                    setProjectPriority(data.priority || "Low");
                    setProjectDeadline(data.deadline || "");
                    setProjectGithubRepo(data.github_repo || data.githubRepo || "");
                    setProjectMembers(data.members || data.project_members || data.users || []);
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

                    if(normalizedColumns.length === 0){
                        localStorage.removeItem('project_view_mode');
                        setViewMode('kanban');
                    }else{
                        const savedViewMode = localStorage.getItem('project_view_mode');
                        if(savedViewMode){
                            setViewMode(savedViewMode);
                        }else{
                            setViewMode('kanban');
                        }
                    }
                } else {
                    throw new Error("Invalid data structure received from server");
                }
            } catch (error) {
                console.error("Error fetching columns:", error);
                setErrorMessage("Failed to connect to the server");
            } finally {
                setIsLoading(false);
            }
        };

        if (urlProjectKey) {
            fetchProjectAndColumns();
        }
    }, [urlProjectKey, navigate, setErrorMessage]);

    useEffect(() => {
        const fetchMe = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) {
                const userData = await res.json();
                setCurrentUserId(userData.id);
            }
        };
        fetchMe();
    }, []);

    useEffect(() => {
        const handleOutsideClick = () => {
            setActiveColumnDropdown(null);
            setActiveTaskDropdown(null);
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    useEffect(() => {
        if (projectOwnerId && currentUserId) {
            setIsOwner(projectOwnerId === currentUserId);
        }
    }, [projectOwnerId, currentUserId]);

    const openEditModal = (type, data = {}, columnId = null) => {
        if (type === 'project') {
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
                members: projectMembers,
                subtasks: [],
                assignees: data.assignees || (data.assignee ? [data.assignee] : [])
            });
        } else if (type === 'task') {
            let formattedDeadline = "";
            if (data.date && data.date !== "No deadline") {
                formattedDeadline = data.date.split('-').reverse().join('-');
            } else if (data.deadline) {
                formattedDeadline = data.deadline.split('T')[0];
            }

            let taskAssignees = [];
            if (Array.isArray(data.assignees) && data.assignees.length > 0) {
                taskAssignees = data.assignees;
            } else if (Array.isArray(data.members) && data.members.length > 0) {
                taskAssignees = data.members;
            } else if (Array.isArray(data.users) && data.users.length > 0) {
                taskAssignees = data.users;
            } else if (data.assignee) {
                taskAssignees = [data.assignee];
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
                startDate: data.startDate || data.start_date || "", 
                deadline: formattedDeadline,
                projectKey: "",
                subtasks: data.subtasks || [],
                assignees: taskAssignees
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
            subtasks: [],
            assignees: []
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

        const assigneeIds = (modalForm.assignees || []).map(u => u.id || u.user_id).filter(Boolean);

       if (modalForm.type === "project") {
        const payload = {
            name: modalForm.name,
            desc: modalForm.desc,
            priority: modalForm.priority,
            start_date: modalForm.startDate || null,
            deadline: modalForm.deadline || null,
            github_repo: modalForm.githubRepo || null
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
            setProjectGithubRepo(updatedProject.github_repo || "");

            // KROK KLUCZOWY: Aktualizacja listy projektów w stanie aplikacji
            if (setProjects) {
                setProjects(prevProjects => 
                    prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
                );
            }

            closeModal();
        } catch (error) {
            console.error("Error updating project: ", error);
            setErrorMessage("Failed to update project");
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
                        assignee_id: assigneeIds[0] || null,
                        assignee_ids: assigneeIds,
                        assignees: modalForm.assignees || [],
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
                setErrorMessage("Failed to save task");
            }
        }
    };

    const confirmExecuteDeleteProject = async () => {
        try {
            await deleteProject({ projectId, redirectTo: '/dashboard'});
        } catch (error) {
            console.error("Error deleting project:", error);
            setErrorMessage("Failed to delete project");
        } finally {
            setConfirmDeleteProject(false);
        }
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

            try {
                const token = localStorage.getItem("token");
                await fetch(`http://localhost:8000/api/projects/${projectId}/columns/reorder`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ column_ids: reorderedColumns.map(col => col.id) })
                });
            } catch (error) {
                console.error("Error reordering columns:", error);
                setErrorMessage("Could not update column order");
            }
            return;
        }

        const sourceColId = parseInt(source.droppableId);
        const destColId = parseInt(destination.droppableId);
        const sourceCol = columns.find(col => col.id === sourceColId);
        const destCol = columns.find(col => col.id === destColId);
        
        if (!sourceCol || !destCol) return;
        const sourceTasks = Array.from(sourceCol.tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);

        const token = localStorage.getItem("token");

        if (sourceColId === destColId) {
            sourceTasks.splice(destination.index, 0, movedTask);
            setColumns(columns.map(col => col.id === sourceColId ? { ...col, tasks: sourceTasks } : col));

            try {
                const taskIds = sourceTasks.map(t => t.id);
                await fetch(`http://localhost:8000/api/projects/${projectId}/columns/${sourceColId}/tasks/reorder`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ task_ids: taskIds })
                });
            } catch (error) {
                console.error("Error reordering tasks:", error);
                setErrorMessage("Could not update task positions");
            }
        } else {
            const destTasks = Array.from(destCol.tasks);
            destTasks.splice(destination.index, 0, movedTask);

            setColumns(columns.map(col => {
                if (col.id === sourceColId) return { ...col, tasks: sourceTasks };
                if (col.id === destColId) return { ...col, tasks: destTasks };
                return col;
            }));

            try {
                await fetch(`http://localhost:8000/api/tasks/${movedTask.id}/move?column_id=${destColId}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const destTaskIds = destTasks.map(t => t.id);
                await fetch(`http://localhost:8000/api/projects/${projectId}/columns/${destColId}/tasks/reorder`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ task_ids: destTaskIds })
                });
            } catch (error) {
                console.error("Error moving task:", error);
                setErrorMessage("Could not update task position");
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
            setErrorMessage("Failed to create list");
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
            setErrorMessage("Failed to rename list");
        }
    };

    const confirmExecuteDeleteList = async () => {
        const columnId = confirmDeleteList.columnId;
        if (!columnId) return;

        try {
            await deleteColumn({ projectId, columnId });

            const remainingColumns = columns.filter(col => col.id !== columnId);
            setColumns(remainingColumns);

            if(remainingColumns.length === 0){
                localStorage.removeItem('project_view_mode');
                setViewMode('kanban');
            }
        } catch (error) {
            console.error("Error deleting list:", error);
            setErrorMessage("Failed to delete list");
        } finally {
            setConfirmDeleteList({ isOpen: false, columnId: null });
        }
    };

    const confirmExecuteDeleteTask = async () => {
        const { columnId, taskId } = confirmDeleteTask;
        if (!columnId || !taskId) return;

        try {
            await deleteTask({ projectId, columnId, taskId });

            setColumns(columns.map(col => {
                if (col.id === columnId) {
                    return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
                }
                return col;
            }));
        } catch (error) {
            console.error("Error deleting task:", error);
            setErrorMessage("Failed to delete task");
        } finally {
            setConfirmDeleteTask({ isOpen: false, columnId: null, taskId: null });
        }
    };

    const handleToggleAnyTask = async (columnId, taskId, isCurrentlyDone, parentTaskId = null) => {
        if (typeof taskId === 'string' && taskId.startsWith('temp-')) {
            setErrorMessage("Save the task first to change subtasks status!");
            return;
        }

        const nextDoneState = !isCurrentlyDone;
        const token = localStorage.getItem("token");

        const endpointUrl = parentTaskId 
            ? `http://localhost:8000/api/subtasks/${taskId}/toggle-complete`
            : `http://localhost:8000/api/tasks/${taskId}/toggle-complete`;

        try {
            const response = await fetch(endpointUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_done: nextDoneState })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Server status ${response.status}`);
            }

            const data = await response.json();

            setColumns(prevColumns => (prevColumns || []).map(col => {
                if (col.id !== columnId) return col;

                return {
                    ...col,
                    tasks: (col.tasks || []).map(t => {
                        if (parentTaskId && t.id === parentTaskId) {
                            const updatedSubtasks = (t.subtasks || []).map(st => {
                                const currentSubId = st.db_id || st.id;
                                
                                if (String(currentSubId) === String(taskId)) {
                                    return {
                                        ...st,
                                        is_done: nextDoneState,
                                        isCompleted: nextDoneState,
                                        progress_prec: nextDoneState ? 100 : 0
                                    };
                                }
                                return st;
                            });

                            const completedCount = updatedSubtasks.filter(st => st.is_done || st.progress_prec === 100).length;
                            const calculatedProgress = updatedSubtasks.length > 0 
                                ? Math.round((completedCount / updatedSubtasks.length) * 100) 
                                : t.progress;

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
                                        progress_prec: match.progress_prec
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
            setErrorMessage(`Problem with server connection: ${error.message}`);
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
                onDeleteList={(colId) => setConfirmDeleteList({ isOpen: true, columnId: colId })}
                onRenameListModal={(column) => setRenameListModal({ isOpen: true, columnId: column.id, name: column.name })}
                onDeleteTask={(colId, taskId) => setConfirmDeleteTask({ isOpen: true, columnId: colId, taskId })}
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
                onDeleteProject={() => setConfirmDeleteProject(true)} 
                onAddList={() => setIsListModalOpen(true)}
                onShowDetails={() => setIsDetailsModalOpen(true)}
            />

            <Modal 
                isOpen={modalForm.isOpen} 
                onClose={closeModal} 
                title={
                    modalForm.type === 'project' ? "Edit Project" : (modalForm.isEdit ? "Edit Task" : "Create New Task")
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
                        projectMembers={projectMembers}
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
                    members={projectMembers}
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

            <ConfirmationModal
                isOpen={confirmDeleteProject}
                onClose={() => setConfirmDeleteProject(false)}
                onConfirm={confirmExecuteDeleteProject}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                submitLabel="Delete Project"
                isDanger={true}
                formId="confirmDeleteProjectForm"
            />

            <ConfirmationModal
                isOpen={confirmDeleteList.isOpen}
                onClose={() => setConfirmDeleteList({ isOpen: false, columnId: null })}
                onConfirm={confirmExecuteDeleteList}
                title="Delete List"
                message="Are you sure you want to delete this list and all of its tasks?"
                submitLabel="Delete List"
                isDanger={true}
                formId="confirmDeleteListForm"
            />

            <ConfirmationModal
                isOpen={confirmDeleteTask.isOpen}
                onClose={() => setConfirmDeleteTask({ isOpen: false, columnId: null, taskId: null })}
                onConfirm={confirmExecuteDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task?"
                submitLabel="Delete Task"
                isDanger={true}
                formId="confirmDeleteTaskForm"
            />
        </DragDropContext>
    );
}