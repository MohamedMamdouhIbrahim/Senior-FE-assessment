import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { TaskStatus } from '../../data-access/models/task.model';

export type BoardFilter = { id: TaskStatus | 'all'; label: string };

@Component({
  selector: 'task-management-ui-board-toolbar',
  templateUrl: './board-toolbar.html',
  styleUrl: './board-toolbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardToolbar {
  readonly filters: BoardFilter[] = [
    { id: 'all', label: 'All' },
    { id: 'todo', label: 'To do' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'done', label: 'Done' },
  ];
  readonly selectedFilter = input.required<TaskStatus | 'all'>();
  readonly prioritySort = input.required<'asc' | 'desc' | null>();
  readonly filterSelected = output<TaskStatus | 'all'>();
  readonly prioritySortToggled = output<void>();
  readonly createTaskClicked = output<void>();
}
