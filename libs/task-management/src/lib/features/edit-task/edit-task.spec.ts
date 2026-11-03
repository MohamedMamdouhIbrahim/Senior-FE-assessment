import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Task, TaskUpdate } from '../../data-access/task.model';
import { EditTask } from './edit-task';

describe('EditTask', () => {
  let fixture: ComponentFixture<EditTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTask],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTask);
    fixture.componentRef.setInput('task', {
      id: 'task-001' as Task['id'],
      title: 'Prepare project brief',
      description: 'Draft the project overview.',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-11-05',
      isOverdue: false,
      completedAt: '',
      assignee: null,
      tags: ['Design'],
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    } satisfies Task);
    await fixture.whenStable();
  });

  it('initializes the form and emits updated values', async () => {
    let updatedTask: TaskUpdate | undefined;
    fixture.componentInstance.taskUpdated.subscribe((task) => {
      updatedTask = task;
    });

    const title = fixture.nativeElement.querySelector(
      '#edit-task-title-input',
    ) as HTMLInputElement;
    expect(title.value).toBe('Prepare project brief');
    title.value = 'Prepare revised brief';
    title.dispatchEvent(new Event('input'));

    await fixture.whenStable();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(updatedTask).toMatchObject({
      title: 'Prepare revised brief',
      description: 'Draft the project overview.',
      dueDate: '2026-11-05',
      tags: ['Design'],
    });
  });
});
