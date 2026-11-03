import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTaskForm } from './create-task';

describe('CreateTaskForm', () => {
  let fixture: ComponentFixture<CreateTaskForm>;
  let component: CreateTaskForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits form values with the selected assignee and tags', async () => {
    fixture.componentRef.setInput('assignees', [
      { id: 'user-002', name: 'Jordan Lee' },
    ]);
    fixture.detectChanges();
    let createdTask: unknown;
    component.taskCreated.subscribe((task) => (createdTask = task));

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
