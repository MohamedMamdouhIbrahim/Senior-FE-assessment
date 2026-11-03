import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskStore } from '../../data-access/task.store';
import type {
  Task,
  TaskCreate,
  TaskPriority,
  TaskStatus,
  TaskUpdate,
} from '../../data-access/task.model';
import {
  KanbanBoardColumn,
  KanbanBoardUi,
} from '../../ui/kanban-board/kanban-board';
import { BoardToolbar } from '../../ui/board-toolbar/board-toolbar';
import { TaskSummary } from '../../ui/task-summary/task-summary';
import type { ColumnDropEvent } from '../../ui/kanban-column/kanban-column';
import { CreateTask } from '../create-task/create-task';
import { EditTask } from '../edit-task/edit-task';

const COLUMN_CONFIG: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

@Component({
  selector: 'task-management-kanban-board',
  imports: [CreateTask, EditTask, KanbanBoardUi, BoardToolbar, TaskSummary],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoard implements OnInit {
  private readonly taskStore = inject(TaskStore);
  private readonly destroyRef$ = takeUntilDestroyed();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly selectedFilter = signal<TaskStatus | 'all'>('all');
  protected readonly prioritySort = signal<'asc' | 'desc' | null>(null);
  protected readonly isCreateTaskOpen = signal(false);
  protected readonly editingTask = signal<Task | null>(null);
  protected readonly tasks = computed(() => this.taskStore.tasks());
  protected readonly assignees = computed(() => [
    ...this.taskStore.assignees(),
  ]);

  protected readonly columns = computed<KanbanBoardColumn[]>(() => {
    const tasksByStatus = this.taskStore.tasksByStatus();
    const filter = this.selectedFilter();
    const direction = this.prioritySort();

    return COLUMN_CONFIG.filter(
      (column) => filter === 'all' || column.id === filter,
    ).map((column) => {
      const tasks = [...tasksByStatus[column.id]];
      if (direction) {
        const multiplier = direction === 'asc' ? 1 : -1;
        tasks.sort(
          (left, right) =>
            multiplier *
            (PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority]),
        );
      }

      return { ...column, tasks };
    });
  });

  ngOnInit(): void {
    if (this.isBrowser && this.taskStore.tasks().length === 0) {
      this.taskStore.loadTasks().pipe(this.destroyRef$).subscribe();
    }
  }

  protected selectFilter(filter: TaskStatus | 'all'): void {
    this.selectedFilter.set(filter);
  }

  protected togglePrioritySort(): void {
    this.prioritySort.update((direction) =>
      direction === 'desc' ? 'asc' : 'desc',
    );
  }

  protected openCreateTask(): void {
    this.isCreateTaskOpen.set(true);
  }

  protected openEditTask(task: Task): void {
    this.editingTask.set(task);
  }

  protected closeCreateTask(): void {
    this.isCreateTaskOpen.set(false);
  }

  protected closeEditTask(): void {
    this.editingTask.set(null);
  }

  protected onTaskCreated(task: TaskCreate): void {
    this.taskStore.addTask(task);
    this.closeCreateTask();
  }

  protected onTaskUpdated(changes: TaskUpdate): void {
    const task = this.editingTask();
    if (!task) {
      return;
    }

    this.taskStore.updateTask(task.id, changes);
    this.closeEditTask();
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
