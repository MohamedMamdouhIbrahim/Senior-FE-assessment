import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import type { Task } from '../../data-access/models/task.model';
import { Avatar } from '@fe-test-workspace/shared/ui/avatar/avatar';
import { Tag } from '@fe-test-workspace/shared/ui/tag/tag';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function calendarDaysBetween(earlierDate: string, laterDate: string): number | undefined {
  const earlier = Date.parse(`${earlierDate.slice(0, 10)}T00:00:00Z`);
  const later = Date.parse(`${laterDate.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(earlier) || !Number.isFinite(later)) {
    return undefined;
  }

  return Math.max(0, Math.floor((later - earlier) / DAY_IN_MILLISECONDS));
}

function formatDuration(days: number): string {
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'}`;
}

@Component({
  selector: 'task-management-summary-card',
  imports: [CdkDrag, CdkDragHandle, Avatar, Tag],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCard {
  readonly task = input.required<Task>();
  readonly taskClick = output<Task>();

  protected overdueDuration(): string {
    const days = calendarDaysBetween(
      this.task().dueDate,
      new Date().toISOString(),
    );
    return days === undefined
      ? 'Overdue'
      : `Overdue by ${formatDuration(days)}`;
  }

  protected completedDuration(): string {
    const completedAt = this.task().completedAt;
    if (!completedAt) {
      return 'Completed';
    }

    const days = calendarDaysBetween(
      completedAt,
      new Date().toISOString(),
    );
    if (days === undefined) {
      return 'Completed';
    }
    if (days === 0) {
      return 'Completed today';
    }
    if (days === 1) {
      return 'Completed yesterday';
    }

    return `Completed ${formatDuration(days)} ago`;
  }
}
