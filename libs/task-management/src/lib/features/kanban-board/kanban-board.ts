import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskStore } from '../../data-access/task.store';
import { KanbanBoardUi, KanbanBoardColumn } from '../../ui/kanban-board/kanban-board';
import type { ColumnDropEvent } from '../../ui/kanban-column/kanban-column';
import type { TaskStatus } from '../../data-access/task.model';

const COLUMN_CONFIG: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

@Component({
  selector: 'task-management-kanban-board',
  imports: [KanbanBoardUi],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoard implements OnInit {
  private readonly taskStore = inject(TaskStore);
  private readonly destroyRef$ = takeUntilDestroyed();

  protected readonly columns = computed<KanbanBoardColumn[]>(() => {
    const tasksByStatus = this.taskStore.tasksByStatus();
    return COLUMN_CONFIG.map((col) => ({
      ...col,
      tasks: [...tasksByStatus[col.id]],
    }));
  });

  ngOnInit(): void {
    // Load tasks only if not already loaded
    if (this.taskStore.tasks().length === 0) {
      this.taskStore.loadTasks().pipe(this.destroyRef$).subscribe();
    }
  }

  protected onTaskDropped(event: ColumnDropEvent): void {
    const { task, newColumnStatus, previousColumnStatus, currentIndex } = event;

    // Same-column reorder
    if (previousColumnStatus === newColumnStatus) {
      this.taskStore.reorderTasksInColumn(
        newColumnStatus,
        task.id,
        currentIndex,
      );
      return;
    }

    // Cross-column move — update task status
    this.taskStore.updateTask(task.id, { status: newColumnStatus });
  }
}
