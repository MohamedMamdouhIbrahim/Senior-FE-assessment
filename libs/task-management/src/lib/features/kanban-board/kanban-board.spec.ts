import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { type Observable, of } from 'rxjs';
import type { Task, TaskStatus } from '../../data-access/task.model';
import { TaskStore } from '../../data-access/task.store';
import { KanbanBoard } from './kanban-board';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;

  beforeEach(async () => {
    const tasks = signal<Task[]>([]);
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
    const taskStoreMock = {
      tasks,
      tasksByStatus: computed(
        () =>
          Object.fromEntries(
            statuses.map((status) => [
              status,
              tasks().filter((task) => task.status === status),
            ]),
          ) as Record<TaskStatus, readonly Task[]>,
      ),
      assignees: signal([]),
      loadTasks: (): Observable<Task[]> => of([]),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      reorderTasksInColumn: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [KanbanBoard],
      providers: [{ provide: TaskStore, useValue: taskStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters the board to the selected status and restores all columns', () => {
    const filterButton = (label: string): HTMLButtonElement =>
      [...fixture.nativeElement.querySelectorAll('.filter-button')].find(
        (button: HTMLButtonElement) => button.textContent.trim() === label,
      ) as HTMLButtonElement;
    const columnTitles = (): string[] =>
      [...fixture.nativeElement.querySelectorAll('.column-title')].map(
        (title: HTMLElement) => title.textContent.trim(),
      );

    filterButton('In progress').click();
    fixture.detectChanges();
    expect(columnTitles()).toEqual(['In Progress']);

    filterButton('All').click();
    fixture.detectChanges();
    expect(columnTitles()).toEqual(['To Do', 'In Progress', 'Done']);
  });

  it('opens the create form and toggles the priority sort direction', () => {
    const buttons = (): HTMLButtonElement[] => [
      ...fixture.nativeElement.querySelectorAll('button'),
    ];

    const createButton = buttons().find(
      (button) => button.textContent.trim() === 'Create task',
    );
    expect(createButton).toBeDefined();
    createButton?.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('task-management-create-task'),
    ).toBeTruthy();

    const sortButton = (): HTMLButtonElement =>
      fixture.nativeElement.querySelector(
        '[aria-label="Sort every column by priority"]',
      );
    sortButton().click();
    fixture.detectChanges();
    expect(sortButton().textContent.trim()).toBe('Priority: High to low');

    sortButton().click();
    fixture.detectChanges();
    expect(sortButton().textContent.trim()).toBe('Priority: Low to high');
  });
});
