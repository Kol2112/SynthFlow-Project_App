import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';

import Modal from './Modal.jsx';
import PanelView from './PanelView.jsx';
import CreateTask from './CreateTask.jsx';
import ProjectKanbanView from './ProjectKanbanView.jsx';
import ProjectListView from './ProjectListView.jsx';

import { useDeleteProject } from "./utils/helperFunctions.js";
import '../styles/ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
    const { projectKey: urlProjectKey } = useParams();
    
    const [projectName, setProjectName] = useState("");
    const [projectKey, setProjectKey] = useState(urlProjectKey || "");
    const [projectId, setProjectId] = useState(null);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [newListName, setNewListName] = useState("");

    const [activeColumnDropdown, setActiveColumnDropdown] = useState(null);
    const [activeTaskDropdown, setActiveTaskDropdown] = useState(null);

    const [renameListModal, setRenameListModal] = useState({
        isOpen: false,
        columnId: null,
        name: ""
    });

    const deleteProject = useDeleteProject();

    const [taskForm, setTaskForm] = useState({
        isOpen: false,
        columnId: null,
        taskId: null,
        isEdit: false,
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

    const handleToggleViewMode = () => {
        const nextMode = viewMode === 'kanban' ? 'list' : 'kanban';
        setViewMode(nextMode);
        localStorage.getItem('project_view_mode');
        localStorage.setItem('project_view_mode', nextMode);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePriorityChange = (newPriority) => {
        setTaskForm(prev => ({ ...prev, priority: newPriority }));
    };

    const openAddTaskModal = (columnId) => {
        setTaskForm({
            isOpen: true,
            columnId,
            taskId: null,
            isEdit: false,
            name: "",
            desc: "",
            priority: "Low",
            startDate: "", 
            deadline: "",
            subtasks: []   
        });
    };

    const openEditTaskModal = (columnId, task) => {
        let formattedDeadline = "";
        if (task.date && task.date !== "No deadline") {
            formattedDeadline = task.date.split('-').reverse().join('-');
        }
        setTaskForm({
            isOpen: true,
            columnId,
            taskId: task.id,
            isEdit: true,
            name: task.name,
            desc: task.desc || "",
            priority: task.priority,
            startDate: task.startDate || "", 
            deadline: formattedDeadline,
            subtasks: task.subtasks || []   
        });
    };

    const closeTaskModal = () => {
        setTaskForm({
            isOpen: false,
            columnId: null,
            name: "",
            desc: "",
            priority: "Low",
            startDate: "", 
            deadline: "",
            subtasks: []   
        });
    };

    const handleDeleteProject = async () => {
        deleteProject({
            projectId, redirectTo: '/dashboard'
        });
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

    const handleToggleTaskComplete = (columnId, taskId, isCompleted) => {
        handleToggleAnyTask(columnId, taskId, isCompleted, null);
    };

    const handleToggleSubtaskComplete = (columnId, parentTaskId, subtaskId, isSubDone) => {
        handleToggleAnyTask(columnId, subtaskId, isSubDone, parentTaskId);
    };

    const handleMoveTask = async (taskId, sourceColId, destColId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/move?column_id=${destColId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to move task");

            const sourceCol = columns.find(col => col.id === sourceColId);
            const destCol = columns.find(col => col.id === destColId);
            if (!sourceCol || !destCol) return;

            const movedTask = sourceCol.tasks.find(t => t.id === taskId);
            if (!movedTask) return;

            setColumns(columns.map(col => {
                if (col.id === sourceColId) {
                    return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
                }
                if (col.id === destColId) {
                    return { ...col, tasks: [...col.tasks, movedTask] };
                }
                return col;
            }));
            setActiveTaskDropdown(null);
        } catch (error) {
            console.error("Error moving task: ", error);
        }
    };

    const handleCreateOrUpdateTask = async (e) => {
        e.preventDefault();
        if (!taskForm.name.trim() || !projectId || !taskForm.columnId) return;

        const url = taskForm.isEdit 
            ? `http://localhost:8000/api/projects/${projectId}/columns/${taskForm.columnId}/tasks/${taskForm.taskId}` 
            : `http://localhost:8000/api/projects/${projectId}/columns/${taskForm.columnId}/tasks`;
        const method = taskForm.isEdit ? "PUT" : "POST";

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: taskForm.name,
                    desc: taskForm.desc,
                    priority: taskForm.priority,
                    start_date: taskForm.startDate || null,
                    deadline: taskForm.deadline || null,
                    subtasks: taskForm.subtasks || []
                })
            });

            if (!response.ok) throw new Error("Failed to save task");

            const savedTask = await response.json();
            
            const formattedTask = {
                id: savedTask.id,
                name: savedTask.name,
                desc: savedTask.desc,
                priority: savedTask.priority,
                startDate: savedTask.start_date || "",
                date: taskForm.deadline ? taskForm.deadline.split('-').reverse().join('-') : "No deadline",
                progress: savedTask.progress_prec,
                progress_prec: savedTask.progress_prec,
                savedProgressBackend: savedTask.saved_progress,
                subtasks: (savedTask.subtasks || []).map(st => ({
                    id: st.id,
                    name: st.name,
                    is_done: st.is_done,
                    isCompleted: st.is_done,
                    savedProgress: st.saved_progress
                }))
            };

            setColumns(columns.map(col => {
                if (col.id === taskForm.columnId) {
                    if (taskForm.isEdit) {
                        return {
                            ...col,
                            tasks: col.tasks.map(t => t.id === taskForm.taskId ? formattedTask : t)
                        };
                    } else {
                        return {
                            ...col,
                            tasks: [...col.tasks, formattedTask]
                        };
                    }
                }
                return col;
            }));

            closeTaskModal();
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const renderMainContent = () => {
        if (isLoading) {
            return <div className="loading">Loading board...</div>;
        }

        if (viewMode === 'list') {
            return (
                <ProjectListView columns={columns} onToggleTaskComplete={handleToggleTaskComplete} onToggleSubtaskComplete={handleToggleSubtaskComplete} onOpenEditModal={openEditTaskModal}/>
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
                onOpenEditTaskModal={openEditTaskModal}
                onDeleteList={handleDeleteList}
                onRenameListModal={(column) => setRenameListModal({ isOpen: true, columnId: column.id, name: column.name })}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onToggleTaskComplete={handleToggleTaskComplete}
                onOpenAddListModal={() => setIsListModalOpen(true)}
            />
        );
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <PanelView headerTitle={projectName} projectKey={projectKey} content={renderMainContent()} showViewToggle={columns.length > 0} viewMode={viewMode} onToggleView={handleToggleViewMode} showSettings={true} onDeleteProject={handleDeleteProject} onAddList={() => setIsListModalOpen(true)}/>

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

            <Modal isOpen={taskForm.isOpen} onClose={closeTaskModal} title={taskForm.isEdit ? "Edit Task" : "Create New Task"} formId="createTaskForm">
                <CreateTask taskForm={taskForm} handleInputChange={handleInputChange} handlePriorityChange={handlePriorityChange} handleCreateTask={handleCreateOrUpdateTask} setTaskForm={setTaskForm}/>
            </Modal>
        </DragDropContext>
    );
}