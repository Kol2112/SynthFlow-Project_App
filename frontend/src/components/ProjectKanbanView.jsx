import { useState } from 'react';
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { FaRegCalendar } from "react-icons/fa";

export default function ProjectKanbanView({ columns = [], activeColumnDropdown, setActiveColumnDropdown, activeTaskDropdown, setActiveTaskDropdown, onOpenAddTaskModal, onOpenEditTaskModal, onDeleteList, onRenameListModal, onDeleteTask, onMoveTask, onToggleTaskComplete, onOpenAddListModal }) {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyId = (e, taskId) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`#${taskId}`);
        setCopiedId(taskId);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const currentDate = new Date().toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    if (columns.length === 0) {
        return (
            <div className="emptyBoardContainer">
                <button className="emptyBoardPlusBtn" onClick={onOpenAddListModal}>
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
                                                <ul className="dropdownElementsContainer">
                                                    <li onClick={() => onRenameListModal(column)}>Rename</li>
                                                    <li onClick={() => onDeleteList(column.id)}><span className='warning'>Delete</span></li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <Droppable droppableId={String(column.id)} type="task">
                                        {(droppableProvided) => (
                                            <div className="tasksContainer" ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                                                {column.tasks && column.tasks.map((task, taskIndex) => (
                                                    <Draggable key={task.id} draggableId={String(task.id)} index={taskIndex}>
                                                        {(taskDraggableProvided) => (
                                                            <div className="taskCard" ref={taskDraggableProvided.innerRef} {...taskDraggableProvided.draggableProps} {...taskDraggableProvided.dragHandleProps}>
                                                                <div className="taskTopRow">
                                                                    <div className="taskTitleGroup">
                                                                        <span 
                                                                            onClick={(e) => handleCopyId(e, task.id)}
                                                                            title="Click to copy task ID for commit"
                                                                            className={`taskIdBadge ${copiedId === task.id ? 'copied' : ''}`}
                                                                        >
                                                                            {copiedId === task.id ? 'Copied!' : `#${task.id}`}
                                                                        </span>
                                                                        <span className="taskName">{task.name}</span>
                                                                    </div>
                                                                    
                                                                    <div className="dropdown" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveTaskDropdown(activeTaskDropdown === task.id ? null : task.id);
                                                                        setActiveColumnDropdown(null);
                                                                    }}>
                                                                        <button className="taskOptionsBtn"><IoEllipsisHorizontal /></button>
                                                                        {activeTaskDropdown === task.id && (
                                                                            <ul className="dropdownElementsContainer">
                                                                                <li onClick={() => onOpenEditTaskModal(column.id, task)}>Edit</li>
                                                                                
                                                                                <li className="moveSubmenuTrigger" onClick={(e) => e.stopPropagation()}>
                                                                                    <span>Move to</span>
                                                                                    <ul className="submenuContainer">
                                                                                        {columns.filter(col => col.id !== column.id).map(destCol => (
                                                                                                <li key={destCol.id} onClick={() => onMoveTask(task.id, column.id, destCol.id)}>
                                                                                                    {destCol.name}
                                                                                                </li>
                                                                                            ))
                                                                                        }
                                                                                        {columns.filter(col => col.id !== column.id).length === 0 && (
                                                                                            <li className="disabledOption">Brak innych list</li>
                                                                                        )}
                                                                                    </ul>
                                                                                </li>

                                                                                <li onClick={() => onDeleteTask(column.id, task.id)}><span className='warning'>Delete</span></li>
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
                                                                    <div className={`taskStatusCheckCircle ${task.progress === 100 ? 'completed' : ''}`} 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onToggleTaskComplete(column.id, task.id, task.progress === 100);
                                                                        }}
                                                                        title={task.progress === 100 ? "Mark as uncompleted" : "Mark as completed"}>
                                                                        {task.progress === 100 && (
                                                                            <svg className="checkIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {droppableProvided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>

                                    <button className="addTaskBtn" onClick={() => onOpenAddTaskModal(column.id)}>
                                        <span className="plusIcon">+</span> Add task
                                    </button>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    <button className="inlineAddListBtn" onClick={onOpenAddListModal}>
                        + Add another list
                    </button>
                </div>
            )}
        </Droppable>
    );
}