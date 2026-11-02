import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { Task, TaskStatus } from '../../data-access/task.model';
import { KanbanColumn, ColumnDropEvent } from '../kanban-column/kanban-column';

export interface KanbanBoardColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'task-management-ui-kanban-board',
  imports: [KanbanColumn],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardUi {
  readonly columns = input<KanbanBoardColumn[]>([]);
  readonly taskDropped = output<ColumnDropEvent>();
  readonly taskClicked = output<Task>();

  protected getConnectedTo(currentId: TaskStatus): TaskStatus[] {
    return this.columns()
      .map((c) => c.id)
      .filter((id) => id !== currentId);
  }
}
