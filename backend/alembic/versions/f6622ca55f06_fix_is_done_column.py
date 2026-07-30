"""fix_is_done_column

Revision ID: f6622ca55f06
Revises: d34559c5e95d
Create Date: 2026-07-29 17:17:19.946559

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6622ca55f06'
down_revision: Union[str, None] = 'd34559c5e95d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Zamiast op.add_column(...) używamy op.alter_column / alter name
    op.alter_column('tasks', 'is_completed', new_column_name='is_done')
    # Jeśli w subtaskach też zmieniasz:
    op.alter_column('subtasks', 'is_completed', new_column_name='is_done')

def downgrade() -> None:
    op.alter_column('tasks', 'is_done', new_column_name='is_completed')
    op.alter_column('subtasks', 'is_done', new_column_name='is_completed')
