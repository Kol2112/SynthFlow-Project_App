import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IoEllipsisHorizontal } from "react-icons/io5";
import { FaRegCalendar } from "react-icons/fa";

import Modal from './Modal.jsx';
import PanelView from './PanelView.jsx';
import CreateTask from './CreateTask.jsx';

import {useDeleteProject} from "./utils/helperFunctions.js";
import '../styles/ProjectDetailsPage.css';

export default function ProjectDetailsPage() {
    const {projectKey: urlProjectKey} = useParams();
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState("");
    const [projectKey, setProjectKey] = useState(urlProjectKey || "");
    const [projectId, setProjectId] = useState(null);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
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
        deadline: ""
    });

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
                    setColumns(data.columns || []);
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

    useEffect(()=>{
        const handleOutsideClick = () =>{
            setActiveColumnDropdown(null);
            setActiveTaskDropdown(null);
        }
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [])

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
            deadline: ""
        });
    };

    const openEditTaskModal = (columnId, task) => {
        let formattedDeadline = "";
        if(task.date && task.date !== "No deadline"){
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
            deadline: formattedDeadline
        });
    }

    const closeTaskModal = () => {
        setTaskForm({
            isOpen: false,
            columnId: null,
            name: "",
            desc: "",
            priority: "Low",
            deadline: ""
        });
    };

    const handleDeleteProject = async () => {
        deleteProject({
            projectId, redirectTo: '/dashboard'
        })
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
        const destCol = columns.find(col=> col.id === destColId);
        
        if(!sourceCol || !destCol) return;
        const sourceTask =Array.from(sourceCol.tasks);
        const [movedTask]= sourceTask.splice(source.index, 1);
        if(sourceColId === destColId){
            sourceTask.splice(destination.index, 0, movedTask);
            setColumns(columns.map(col => col.id === sourceColId ? {...col, tasks: sourceTask} : col));
        }else{
            const destTasks = Array.from(destCol.tasks);
            destTasks.splice(destination.index, 0, movedTask);

            setColumns(columns.map(col=>{
                if(col.id === sourceColId) return {...col, tasks: sourceTask};
                if(col.id === destColId) return {...col, tasks: destTasks};
                return col;
            }));

            try{
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/api/tasks/${movedTask.id}/move?column_id=${destColId}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if(!response.ok){
                    throw new Error("Failed to persist task movement in database");
                }
            }catch (error){
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

            if (!response.ok) {
                throw new Error("Failed to create column");
            }

            const createdColumn = await response.json();
            const formattedColumn = { ...createdColumn, tasks: [] };

            setColumns([...columns, formattedColumn]);
            setNewListName("");
            setIsListModalOpen(false);
        } catch (error) {
            console.error("Error creating list on backend:", error);
        }
    };

    const handleRenameList = async (e) =>{
        e.preventDefault();
        if(!renameListModal.name.trim() || !projectId || !renameListModal.columnId) return;

        try{
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/columns/${renameListModal.columnId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: renameListModal.name })
            });
            if(!response.ok){
                throw new Error("Failed to rename list");
            }

            setColumns(columns.map(col=> col.id === renameListModal.columnId ? {...col, name: renameListModal.name}: col));
            setRenameListModal({isOpen: false, columnId: null, name: ""});
        } catch(error){
            console.error("Error renaming list:", error)
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

            if (!response.ok) {
                throw new Error("Failed to delete column");
            }

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

            if (!response.ok) {
                throw new Error("Failed to delete task");
            }

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
    const handleMoveTask = async (taskId, sourceColId, destColId) =>{
        try{
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/move?column_id=${destColId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error("Failed to move task");
            }
            const sourceCol = columns.find(col => col.id === sourceColId);
            const destCol = columns.find(col => col.id === destColId);
            if(!sourceCol || !destCol) return;

            const movedTask = sourceCol.tasks.find(t=> t.id === taskId);
            if(!movedTask) return;
            setColumns(columns.map(col =>{
                if(col.id === sourceColId){
                    return {...col, tasks: col.tasks.filter(t=> t.id !== taskId)};
                }
                if(col.id === destColId){
                    return {... col, tasks: [...col.tasks, movedTask]}
                }
                return col;
            }))
            setActiveTaskDropdown(null);
        }catch(error){
            console.error("Error moving task: ", error);
        }
    }
    const handleCreateOrUpdateTask = async (e) => {
        e.preventDefault();
        if (!taskForm.name.trim() || !projectId || !taskForm.columnId) return;

        const url = taskForm.isEdit ? `http://localhost:8000/api/projects/${projectId}/columns/${taskForm.columnId}/tasks/${taskForm.taskId}` : `http://localhost:8000/api/projects/${projectId}/columns/${taskForm.columnId}/tasks`;
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
                    deadline: taskForm.deadline || null
                })
            });

            if (!response.ok) {
                throw new Error("Failed to save task");
            }

            const savedTask = await response.json();
            
            const formattedTask = {
                id: savedTask.id,
                name: savedTask.name,
                desc: savedTask.desc,
                priority: savedTask.priority,
                date: taskForm.deadline ? taskForm.deadline.split('-').reverse().join('-') : "No deadline",
                progress: savedTask.progress_prec
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

    const renderContent = () => {
        const currentDate = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (isLoading) {
            return <div className="loading">Loading board...</div>;
        }

        if (columns.length === 0) {
            return (
                <div className="emptyBoardContainer">
                    <button className="emptyBoardPlusBtn" onClick={() => setIsListModalOpen(true)}>
                        <span className="hugePlusIcon">+</span>
                        <p className="emptyStateLabel">Create your first list</p>
                    </button>
                </div>
            );
        }

        return (
<Droppable droppableId="board-columns" direction="horizontal" type="column">
                {(provided) => (
                    <div className="kanbanBoard" ref={provided.innerRef} {...provided.droppableProps}>
                        {columns.map((column, index) => (
                            <Draggable key={column.id} draggableId={String(column.id)} index={index}>
                                {(draggableProvided) => (
                                    <div className="kanbanColumn" ref={draggableProvided.innerRef} {...draggableProvided.draggableProps}>
                                        <div className="columnHeader" {...draggableProvided.dragHandleProps}>
                                            <span className="columnTitle">{column.name}</span>
                                            
                                            <div className="dropdown" onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveColumnDropdown(activeColumnDropdown === column.id ? null : column.id);
                                                setActiveTaskDropdown(null);
                                            }}>
                                                <button className="columnOptionsBtn"><IoEllipsisHorizontal /></button>
                                                {activeColumnDropdown === column.id && (
                                                    <ul className="dropdownElementsContainer" style={{ width: 'max-content', minWidth: '110px' }}>
                                                        <li onClick={() => setRenameListModal({ isOpen: true, columnId: column.id, name: column.name })}>Rename</li>
                                                        <li onClick={() => handleDeleteList(column.id)}><span className='warning'>Delete</span></li>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        <Droppable droppableId={String(column.id)} type="task">
                                            {(droppableProvided) => (
                                                <div 
                                                    className="tasksContainer" 
                                                    ref={droppableProvided.innerRef} 
                                                    {...droppableProvided.droppableProps}
                                                >
                                                    {column.tasks && column.tasks.map((task, taskIndex) => (
                                                        <Draggable key={task.id} draggableId={String(task.id)} index={taskIndex}>
                                                            {(taskDraggableProvided) => (
                                                                <div 
                                                                    className="taskCard"
                                                                    ref={taskDraggableProvided.innerRef}
                                                                    {...taskDraggableProvided.draggableProps}
                                                                    {...taskDraggableProvided.dragHandleProps}
                                                                >
                                                                    <div className="taskTopRow">
                                                                        <span className="taskName">{task.name}</span>
                                                                        
                                                                        <div className="dropdown" onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveTaskDropdown(activeTaskDropdown === task.id ? null : task.id);
                                                                            setActiveColumnDropdown(null);
                                                                        }}>
                                                                            <button className="taskOptionsBtn"><IoEllipsisHorizontal /></button>
                                                                            {activeTaskDropdown === task.id && (
                                                                                <ul className="dropdownElementsContainer" style={{ width: 'max-content', minWidth: '110px' }}>
                                                                                    <li onClick={() => openEditTaskModal(column.id, task)}>Edit</li>
                                                                                    
                                                                                    {/* Podmenu Przenoszenia */}
                                                                                    <li className="moveSubmenuTrigger" onClick={(e) => e.stopPropagation()}>
                                                                                        <span>Move to</span>
                                                                                        <ul className="submenuContainer">
                                                                                            {columns
                                                                                                .filter(col => col.id !== column.id)
                                                                                                .map(destCol => (
                                                                                                    <li 
                                                                                                        key={destCol.id} 
                                                                                                        onClick={() => handleMoveTask(task.id, column.id, destCol.id)}
                                                                                                    >
                                                                                                        {destCol.name}
                                                                                                    </li>
                                                                                                ))
                                                                                            }
                                                                                            {columns.filter(col => col.id !== column.id).length === 0 && (
                                                                                                <li className="disabledOption">Brak innych list</li>
                                                                                            )}
                                                                                        </ul>
                                                                                    </li>

                                                                                    <li onClick={() => handleDeleteTask(column.id, task.id)}><span className='warning'>Delete</span></li>
                                                                                </ul>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="taskMetaRow">
                                                                        <div className={"taskDateBlock".concat(currentDate > task.date ? ' warning': '')}>
                                                                            <FaRegCalendar className="calendarIcon" />
                                                                            <span>{task.date}</span>
                                                                        </div>
                                                                        <span className="progressPct">{task.progress}%</span>
                                                                    </div>
                                                                    <div className="taskBottomRow">
                                                                        <div className="taskAssignees">
                                                                            <div className="assigneeAvatar" title="Only you">
                                                                                <span className="avatarText">Only you</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="taskStatusCheckCircle"></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {droppableProvided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>

                                        <button className="addTaskBtn" onClick={() => openAddTaskModal(column.id)}>
                                            <span className="plusIcon">+</span> Add task
                                        </button>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        <button className="inlineAddListBtn" onClick={() => setIsListModalOpen(true)}>
                            + Add another list
                        </button>
                    </div>
                )}
            </Droppable>
        );
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <PanelView headerTitle={projectName} projectKey={projectKey} content={renderContent()} showViewToggle={columns.length > 0} showSettings={true} onDeleteProject={handleDeleteProject} onAddList={()=>{setIsListModalOpen(true)}}/>

            <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title="Create new list" formId="createListForm">
                <form id="createListForm" onSubmit={handleCreateList}>
                    <input 
                        type="text" 
                        placeholder="e.g., In Progress, QA, Blocked..." 
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        autoFocus
                        className="modalInput"
                    />
                </form>
            </Modal>

            <Modal isOpen={renameListModal.isOpen} onClose={() => setRenameListModal({ isOpen: false, columnId: null, name: "" })} title="Rename list" formId="renameListForm">
                <form id="renameListForm" onSubmit={handleRenameList}>
                    <input 
                        type="text" 
                        placeholder="List name..." 
                        value={renameListModal.name}
                        onChange={(e) => setRenameListModal(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                        className="modalInput"
                        required
                    />
                </form>
            </Modal>

            <Modal isOpen={taskForm.isOpen} onClose={closeTaskModal} title={taskForm.isEdit ? "Edit Task" : "Create New Task"} formId="createTaskForm">
                <CreateTask 
                    taskForm={taskForm}
                    handleInputChange={handleInputChange}
                    handlePriorityChange={handlePriorityChange}
                    handleCreateTask={handleCreateOrUpdateTask}
                />
            </Modal>
        </DragDropContext>
    );
}