import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import type {
  Assignee,
  Task,
  TaskCreate,
  TaskUpdate,
} from '../../data-access/models/task.model';
import { PRIORITIES, STATUSES } from '../../data-access/task-constants';

@Component({
  selector: 'task-management-edit-task',
  imports: [FormField],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTask {
  readonly task = input.required<Task>();
  readonly assignees = input<Assignee[]>([]);
  readonly taskUpdated = output<TaskUpdate>();
  readonly cancelled = output<void>();

  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  protected readonly tagInput = signal('');
  protected readonly taskModel = linkedSignal<TaskCreate>(() => {
    const task = this.task();
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      isOverdue: task.isOverdue,
      tags: [...task.tags],
      assigneeId: task.assignee?.id,
    };
  });
  protected readonly taskForm = form(this.taskModel, (path) => {
    required(path.title, { message: 'Title is required.' });
    minLength(path.title, 3, {
      message: 'Title must be at least 3 characters long.',
    });
    required(path.dueDate, { message: 'Due date is required.' });
  });

  protected updateTask(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.taskForm().valid()) {
      return;
    }

    this.taskUpdated.emit(this.taskModel());
  }

  protected handleTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    }
  }

  protected updateTagInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.tagInput.set(target.value);
    }
  }

  protected updateAssignee(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      const assignee = this.assignees().find(({ id }) => id === target.value);
      this.taskModel.update((task) => ({
        ...task,
        assigneeId: assignee?.id,
      }));
    }
  }

  protected addTag(): void {
    const tag = this.tagInput().trim().replace(/,$/, '').trim();
    if (!tag) {
      this.tagInput.set('');
      return;
    }

    this.taskModel.update((task) =>
      task.tags.some(
        (existingTag) =>
          existingTag.toLocaleLowerCase() === tag.toLocaleLowerCase(),
      )
        ? task
        : { ...task, tags: [...task.tags, tag] },
    );
    this.tagInput.set('');
  }

  protected removeTag(tagToRemove: string): void {
    this.taskModel.update((task) => ({
      ...task,
      tags: task.tags.filter((tag) => tag !== tagToRemove),
    }));
  }
}
