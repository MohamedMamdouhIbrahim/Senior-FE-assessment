import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Assignee, TaskCreate } from '../../data-access/models/task.model';
import { CreateTask } from './create-task';

describe('CreateTask', () => {
  let fixture: ComponentFixture<CreateTask>;
  let component: CreateTask;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTask],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a task with form values, assignee, and tags', async () => {
    let createdTask: TaskCreate | undefined;
    component.taskCreated.subscribe((task) => (createdTask = task));
    fixture.componentRef.setInput('assignees', [
      {
        id: 'user-002' as Assignee['id'],
        name: 'Alex Morgan',
        avatar: '',
        email: 'alex@example.com',
      },
    ]);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector(
      '#task-title',
    ) as HTMLInputElement;
    title.value = 'Prepare project brief';
    title.dispatchEvent(new Event('input'));

    const dueDate = fixture.nativeElement.querySelector(
      '#task-due-date',
    ) as HTMLInputElement;
    dueDate.value = '2026-11-05';
    dueDate.dispatchEvent(new Event('input'));

    const assignee = fixture.nativeElement.querySelector(
      '#task-assignee',
    ) as HTMLSelectElement;
    assignee.value = 'user-002';
    assignee.dispatchEvent(new Event('change'));

    const tagInput = fixture.nativeElement.querySelector(
      '#task-tags',
    ) as HTMLInputElement;
    tagInput.value = 'Design';
    tagInput.dispatchEvent(new Event('input'));
    tagInput.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    await fixture.whenStable();
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(createdTask).toMatchObject({
      title: 'Prepare project brief',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-11-05',
      assigneeId: 'user-002',
      tags: ['Design'],
    });
  });
});
