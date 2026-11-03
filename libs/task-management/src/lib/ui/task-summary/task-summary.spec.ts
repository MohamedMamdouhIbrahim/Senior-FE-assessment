import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Task } from '../../data-access/task.model';
import { TaskSummary } from './task-summary';

describe('TaskSummary', () => {
  let fixture: ComponentFixture<TaskSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskSummary);
    const now = new Date();
    const dateKey = (date: Date): string =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const today = dateKey(now);
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const createTask = (
      id: string,
      status: Task['status'],
      dueDate: string,
      completedAt = '',
    ): Task => ({
      id: id as Task['id'],
      title: id,
      description: '',
      status,
      priority: 'medium',
      dueDate,
      isOverdue: status !== 'done' && dueDate < today,
      completedAt,
      assignee: null,
      tags: [],
      createdAt: `${today}T10:00:00.000Z`,
      updatedAt: `${today}T10:00:00.000Z`,
    });

    fixture.componentRef.setInput('tasks', [
      createTask('completed', 'done', today, `${today}T12:00:00.000Z`),
      createTask('in-progress', 'in_progress', dateKey(tomorrow)),
      createTask('overdue', 'todo', dateKey(yesterday)),
      createTask('due-today', 'todo', today),
    ]);
    await fixture.whenStable();
  });

  it('shows task totals and the requested time-based details', () => {
    const metrics = [
      ...fixture.nativeElement.querySelectorAll('.summary-metric'),
    ] as HTMLElement[];
    const metric = (label: string): HTMLElement | undefined =>
      metrics.find(
        (element) =>
          element.querySelector('.metric-label')?.textContent?.trim() === label,
      );

    expect(metrics).toHaveLength(4);
    expect(
      metric('Total tasks')?.querySelector('.metric-value')?.textContent,
    ).toBe('4');
    expect(
      metric('Total tasks')?.querySelector('.metric-detail')?.textContent,
    ).toBe('+4 this week');
    expect(
      metric('Completed')?.querySelector('.metric-value')?.textContent,
    ).toBe('1');
    expect(
      metric('Completed')?.querySelector('.metric-detail')?.textContent,
    ).toBe('1 today');
    expect(
      metric('In progress')?.querySelector('.metric-value')?.textContent,
    ).toBe('1');
    expect(
      metric('In progress')?.querySelector('.metric-detail')?.textContent,
    ).toBe('Same as yesterday');
    expect(metric('Overdue')?.querySelector('.metric-value')?.textContent).toBe(
      '1',
    );
    expect(
      metric('Overdue')?.querySelector('.metric-detail')?.textContent,
    ).toBe('1 due today');
  });
});
