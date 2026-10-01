from sqlalchemy.orm import Session
from typing import Optional
import models

def create_notification(db: Session, user_id: int, title: str, message: str, notification_type: str, project_id: Optional[int] = None, task_id: Optional[int] = None) -> models.Notification:
    notification = models.Notification(user_id=user_id, title=title, message=message, type=notification_type, project_id=project_id, task_id=task_id)
    db.add(notification)
    return notification


def send_project_invite(project, invited_user, inviter, db: Session):
    inviter_name = f"{inviter.name} {inviter.surname}".strip() or inviter.email
    create_notification(db, user_id=invited_user.id, title="Project Invitation", message=f"{inviter_name} invited you to project '{project.name}'.", notification_type="PROJECT_INVITE", project_id=project.id)

def accept_project_invite(project, user, db: Session):
    user_name = f"{user.name} {user.surname}".strip() or user.email
    create_notification(db, user_id=project.owner_id, title="Invitation Accepted", message=f"{user_name} accepted your invitation to project '{project.name}'.", notification_type="INVITE_ACCEPTED", project_id=project.id)

def change_member_role(project, target_user, new_role_name: str, db: Session):
    create_notification(db, user_id=target_user.id, title="Role Changed", message=f"Your permissions in project {project.name} were updated to: {new_role_name}.", notification_type="ROLE_CHANGED", project_id=project.id)

def remove_member_from_project(project, target_user, db: Session):
    create_notification(db, user_id=target_user.id, title="Removed from Project", message=f"You were removed from project '{project.name}' by the owner.", notification_type="PROJECT_REMOVED", project_id=project.id)

def update_task_assignees(task, new_assignee_ids: list[int], current_user, db: Session):
    old_ids = {u.id for u in task.assignees}
    new_ids = set(new_assignee_ids)

    added_ids = new_ids - old_ids
    for uid in added_ids:
        if uid != current_user.id:
            assigner_name = current_user.name or current_user.email
            create_notification(db, user_id=uid, title="Assigned to Task", message=f"{assigner_name} assigned you to task: '{task.name}'.", notification_type="TASK_ASSIGNED", project_id=task.project_id, task_id=task.id)

    removed_ids = old_ids - new_ids
    for uid in removed_ids:
        if uid != current_user.id:
            create_notification(db, user_id=uid, title="Unassigned from Task", message=f"You were removed from task '{task.name}'.", notification_type="TASK_UNASSIGNED", project_id=task.project_id, task_id=task.id)

def notify_task_status_change(task, new_status_name: str, current_user, db: Session):
    for assignee in task.assignees:
        if assignee.id != current_user.id:
            create_notification(db, user_id=assignee.id, title="Task Status Changed", message=f"Task '{task.name}' status was updated to '{new_status_name}'.", notification_type="TASK_STATUS_CHANGED", project_id=task.project_id, task_id=task.id
            )

def notify_project_deadline_change(project, new_deadline, members: list, db: Session):
    formatted_date = new_deadline.strftime("%d %B %Y")
    for member in members:
        create_notification(db, user_id=member.user_id, title="Project Deadline Changed", message=f"The owner changed the deadline for '{project.name}' to {formatted_date}.", notification_type="PROJECT_DEADLINE_CHANGED", project_id=project.id
        )