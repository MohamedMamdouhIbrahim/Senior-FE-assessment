import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import type { Task } from '../../data-access/task.model';
import { Avatar } from '@fe-test-workspace/shared/ui/avatar/avatar';
import { Tag } from '@fe-test-workspace/shared/ui/tag/tag';
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
}
