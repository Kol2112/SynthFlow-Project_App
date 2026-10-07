import { Droppable, Draggable } from "@hello-pangea/dnd";
import { IoEllipsisHorizontal } from "react-icons/io5";

import TasksContainer from './utils/TaskContainer.jsx';
import '../styles/ProjectKanbanView.css';
import '../styles/DropDown.css';

export default function ProjectKanbanView({ 
    columns = [], 
    activeColumnDropdown, 
    setActiveColumnDropdown, 
    activeTaskDropdown, 
    setActiveTaskDropdown, 
    onOpenAddTaskModal, 
    onOpenEditTaskModal, 
    onDeleteList, 
    onRenameListModal, 
    onDeleteTask, 
    onMoveTask, 
    onToggleTaskComplete, 
    onOpenAddListModal 
}) {

    const getTaskAssignees = (task) => {
        if (Array.isArray(task.assignees) && task.assignees.length > 0) return task.assignees;
        if (Array.isArray(task.members) && task.members.length > 0) return task.members;
        if (Array.isArray(task.users) && task.users.length > 0) return task.users;
        if (task.assignee) return [task.assignee];
        return [];
    };

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
                                            <button className="columnOptionsBtn" onMouseDown={(e) => e.stopPropagation()}>
                                                <IoEllipsisHorizontal />
                                            </button>
                                            {activeColumnDropdown === column.id && (
                                                <ul className="dropdownElementsContainer">
                                                    <li onClick={() => onRenameListModal(column)}>Rename</li>
                                                    <li onClick={() => onDeleteList(column.id)}><span className='warning'>Delete</span></li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <TasksContainer 
                                        column={column}
                                        columns={columns}
                                        activeTaskDropdown={activeTaskDropdown}
                                        setActiveTaskDropdown={setActiveTaskDropdown}
                                        setActiveColumnDropdown={setActiveColumnDropdown}
                                        onOpenEditTaskModal={onOpenEditTaskModal}
                                        onMoveTask={onMoveTask}
                                        onDeleteTask={onDeleteTask}
                                        onToggleTaskComplete={onToggleTaskComplete}
                                        getTaskAssignees={getTaskAssignees}
                                    />

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