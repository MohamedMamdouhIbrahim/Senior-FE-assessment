import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';

export type CreateTaskFormValue = {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  isOverdue: boolean;
  tags: string[];
  assigneeId?: string;
};

export type CreateTaskAssignee = {
  id: string;
  name: string;
};

const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
] as const;

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

@Component({
  selector: 'task-management-create-task-form',
  imports: [FormField],
  templateUrl: './create-task.html',
  styleUrl: './create-task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTaskForm {
  readonly assignees = input<CreateTaskAssignee[]>([]);
  readonly taskCreated = output<CreateTaskFormValue>();
  readonly cancelled = output<void>();

  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  protected readonly tagInput = signal('');
  protected readonly taskModel = signal<CreateTaskFormValue>({
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
