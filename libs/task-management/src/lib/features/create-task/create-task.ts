import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import type { Assignee, TaskCreate } from '../../data-access/models/task.model';
import { PRIORITIES, STATUSES } from '../../data-access';

@Component({
  selector: 'task-management-create-task',
  imports: [FormField],
  templateUrl: './create-task.html',
  styleUrl: './create-task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTask {
  //#region inputs
  readonly assignees = input<Assignee[]>([]);
  //#endregion inputs

  //#region outputs
  readonly taskCreated = output<TaskCreate>();
  readonly cancelled = output<void>();
  //#endregion outputs

  //#region consts
  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  //#endregion consts

  //#region class properties
  protected readonly tagInput = signal('');
  protected readonly taskModel = signal<TaskCreate>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    isOverdue: false,
    tags: [],
    assigneeId: undefined,
  });
  protected readonly taskForm = form(this.taskModel, (path) => {
    required(path.title, { message: 'Title is required.' });
    minLength(path.title, 3, {
      message: 'Title must be at least 3 characters long.',
    });
    required(path.dueDate, { message: 'Due date is required.' });
  });
  //#endregion class properties

  //#region template methods
  protected createTask(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.taskForm().valid()) {
      return;
    }

    this.taskCreated.emit(this.taskModel());
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
      const assignee = this.assignees()?.find(({ id }) => id === target.value);
      this.taskModel.update((task) => ({ ...task, assigneeId: assignee?.id }));
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
  //#endregion template methods
}
