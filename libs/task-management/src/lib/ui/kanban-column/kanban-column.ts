import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import type { Task, TaskStatus } from '../../data-access/models/task.model';
import { SummaryCard } from '../summary-card/summary-card';

export type ColumnDropEvent = {
  task: Task;
  previousColumnStatus: TaskStatus;
  newColumnStatus: TaskStatus;
  previousIndex: number;
  currentIndex: number;
};

@Component({
  selector: 'task-management-kanban-column',
  imports: [CdkDropList, SummaryCard],
  templateUrl: './kanban-column.html',
  styleUrl: './kanban-column.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumn {
  readonly columnTitle = input.required<string>();
  readonly columnStatus = input.required<TaskStatus>();
  readonly tasks = input<Task[]>([]);
  /** IDs of other drop-list elements this list can receive items from */
  readonly connectedTo = input<string[]>([]);
  readonly taskDropped = output<ColumnDropEvent>();
  readonly taskClicked = output<Task>();

  protected onDrop(event: CdkDragDrop<Task[], Task[], Task>): void {
    const task: Task = event.item.data;
    const previousColumnStatus: TaskStatus =
      event.previousContainer.data[event.previousIndex]?.status ??
      this.columnStatus();

    this.taskDropped.emit({
      task,
      previousColumnStatus,
      newColumnStatus: this.columnStatus(),
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
}
