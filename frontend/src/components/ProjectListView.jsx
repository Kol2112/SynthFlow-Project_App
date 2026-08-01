import { useState } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";

import PriorityDots from './utils/PriorityDots.jsx';
import '../styles/ProjectListView.css';

export default function ProjectListView({ columns = [], onToggleTaskComplete, onToggleSubtaskComplete, onOpenEditModal }) {
  const [expandedTasks, setExpandedTasks] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'No deadline') return 'No deadline';
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts[0].length === 4) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    }
    return dateString;
  };

  const currentDate = new Date().toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const totalTasksCount = columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0);

  if (totalTasksCount === 0) {
    return (
      <div className="emptyBoardContainer">
        <p className="emptyStateLabel">No tasks found in this project</p>
      </div>
    );
  }

  return (
    <div className="taskListContainer">
      <div className="taskListHeader">
        <div>Task name</div>
        <div>Status</div>
        <div>Assignee</div>
        <div>Completeness</div>
        <div>Priority</div>
        <div>Deadline</div>
        <div></div>
      </div>

      <div className="taskListBody">
        {columns.map((column) => 
          (column.tasks || []).map((task) => {
            const taskId = task.id;
            const isExpanded = !!expandedTasks[taskId];
            const subtasks = task.subtasks || [];
            const hasSubtasks = subtasks.length > 0;
            const isCompleted = task.progress === 100;
            const formattedDeadline = formatDate(task.date);
            const isOverdue = formattedDeadline !== 'No deadline' && currentDate > formattedDeadline;

            return (
              <div key={taskId} className={`taskItemGroup ${isExpanded ? 'expanded' : ''}`}>
                <div className="taskListRow">
                  <div className="taskTitleCell">
                    {hasSubtasks ? (
                      <button className="expandBtn" onClick={() => toggleExpand(taskId)}>
                        {isExpanded ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                      </button>
                    ) : (
                      <span className="expandPlaceholder" />
                    )}

                    <div className={`taskStatusCheckCircle ${isCompleted ? 'completed' : ''}`} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleTaskComplete) {
                          onToggleTaskComplete(column.id, task.id, isCompleted);
                        }
                      }}
                      title={isCompleted ? "Mark as uncompleted" : "Mark as completed"}>
                      {isCompleted && (
                        <svg className="checkIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    <span 
                      onClick={(e) => handleCopyId(e, task.id)}
                      title="Click to copy task ID for commit"
                      className={`taskIdBadge ${copiedId === task.id ? 'copied' : ''}`}
                    >
                      {copiedId === task.id ? 'Copied!' : `#${task.id}`}
                    </span>

                    <span className={`taskTitleText ${isCompleted ? 'completedText' : ''}`}>
                      {task.name}
                    </span>
                  </div>

                  <div>
                    <span className="statusText">{column.name}</span>
                  </div>

                  <div>
                    <div className="assigneeAvatar" title="Only you">
                      <span className="avatarText">Only you</span>
                    </div>
                  </div>

                  <div>
                    <span className="completenessText">{task.progress || 0}%</span>
                  </div>

                  <div>
                    <PriorityDots priority={task.priority} />
                  </div>

                  <div>
                    <span className={`deadlineText ${isOverdue ? 'warning' : ''}`}>
                      {formattedDeadline}
                    </span>
                  </div>

                  <div>
                    <button className="detailsBtn" 
                      onClick={() => {
                        if (onOpenEditModal) {
                          onOpenEditModal(column.id, task);
                        }
                      }}>
                      Details
                    </button>
                  </div>
                </div>

                {hasSubtasks && isExpanded && (
                  <div className="subtasksContainer">
                    {subtasks.map((subtask) => {
                      const isSubDone = subtask.is_done;
                      const rawSubtaskDate = subtask.date || subtask.deadline || task.date;
                      const formattedSubtaskDeadline = formatDate(rawSubtaskDate);
                      const isSubtaskOverdue = formattedSubtaskDeadline !== 'No deadline' && currentDate > formattedSubtaskDeadline;

                      return (
                        <div key={subtask.id} className="subtaskRow">
                          <div className="subtaskTitleCell">
                            <span 
                              onClick={(e) => handleCopyId(e, subtask.id)}
                              title="Click to copy subtask ID for commit"
                              className={`taskIdBadge subtask ${copiedId === subtask.id ? 'copied' : ''}`}
                            >
                              {copiedId === subtask.id ? 'Copied!' : `#${subtask.id}`}
                            </span>

                            <span className={`subtaskTitleText ${isSubDone ? 'completedText' : ''}`}>
                              {subtask.name}
                            </span>
                          </div>

                          <div>
                            <span className="statusText">{column.name}</span>
                          </div>

                          <div>
                            <div className="assigneeAvatar" title="Only you">
                              <span className="avatarText">Only you</span>
                            </div>
                          </div>

                          <div>
                            <div className={`taskStatusCheckCircle ${isSubDone ? 'completed' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof subtask.id === 'string' && subtask.id.startsWith('temp-')) {
                                  alert("Zapisz najpierw zadanie, aby móc zmieniać status nowych podzadań!");
                                  return;
                                }
                                
                                if (onToggleSubtaskComplete) {
                                  const actualSubtaskId = subtask.db_id || subtask.id;
                                  onToggleSubtaskComplete(column.id, task.id, actualSubtaskId, isSubDone);
                                }
                              }}
                              title={isSubDone ? "Mark subtask as uncompleted" : "Mark subtask as completed"}>
                              {isSubDone && (
                                <svg className="checkIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div>
                            <PriorityDots priority={task.priority} />
                          </div>

                          <div>
                            <span className={`deadlineText ${isSubtaskOverdue ? 'warning' : ''}`}>
                              {formattedSubtaskDeadline}
                            </span>
                          </div>

                          <div></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}