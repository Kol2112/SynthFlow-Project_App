from datetime import datetime, timedelta
from database import SessionLocal
import models
from .notification import create_notification

def check_task_deadlines():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        in_24h_start = now + timedelta(hours=23)
        in_24h_end = now + timedelta(hours=25)


        upcoming_tasks = db.query(models.Task).filter(
            models.Task.due_date >= in_24h_start,
            models.Task.due_date <= in_24h_end,
            models.Task.is_completed == False
        ).all()

        for task in upcoming_tasks:
            for user in task.assignees:
                create_notification(
                    db,
                    user_id=user.id,
                    title="Zbliżający się termin",
                    message=f"Zadanie '{task.name}' kończy się za 24 godziny.",
                    notification_type="TASK_DEADLINE_APPROACHING",
                    project_id=task.project_id,
                    task_id=task.id
                )


        overdue_tasks = db.query(models.Task).filter(
            models.Task.due_date < now,
            models.Task.due_date >= now - timedelta(hours=1),
            models.Task.is_completed == False
        ).all()

        for task in overdue_tasks:
            for user in task.assignees:
                create_notification(
                    db,
                    user_id=user.id,
                    title="Przekroczono termin",
                    message=f"Zadanie '{task.name}' przekroczyło planowany termin wykonania.",
                    notification_type="TASK_DEADLINE_OVERDUE",
                    project_id=task.project_id,
                    task_id=task.id
                )

        db.commit()
    finally:
        db.close()  