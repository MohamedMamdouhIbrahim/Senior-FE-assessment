import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { Task } from '../../data-access/task.model';
import { getTaskSummaryDetails } from '../../utils/task-summary.utils';

@Component({
  selector: 'task-management-ui-task-summary',
  templateUrl: './task-summary.html',
  styleUrl: './task-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskSummary {
  readonly tasks = input.required<readonly Task[]>();
  protected readonly metrics = computed(() => {
    const tasks = this.tasks();
    const now = new Date();
    const details = getTaskSummaryDetails(tasks, now);
    const activeTasks = tasks.filter((task) => task.status !== 'done');

    return [
      {
        label: 'Total tasks',
        value: tasks.length,
        detail: details.createdThisWeek,
        style: 'total',
      },
      {
        label: 'Completed',
        value: tasks.filter((task) => task.status === 'done').length,
        detail: details.completedToday,
        style: 'completed',
      },
      {
        label: 'In progress',
        value: tasks.filter((task) => task.status === 'in_progress').length,
        detail: 'Same as yesterday',
        style: 'in-progress',
      },
      {
        label: 'Overdue',
        value: activeTasks.filter((task) => task.isOverdue).length,
        detail: details.dueToday,
        style: 'overdue',
      },
    ];
  });
}
