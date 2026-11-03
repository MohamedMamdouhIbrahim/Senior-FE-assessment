import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Task } from '../../data-access/models/task.model';
import { SummaryCard } from './summary-card';

describe('SummaryCard', () => {
  let component: SummaryCard;
  let fixture: ComponentFixture<SummaryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', {
      id: 'task-001' as Task['id'],
      title: 'Prepare project brief',
      description: '',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-11-01',
      isOverdue: true,
      completedAt: '',
      assignee: null,
      tags: [],
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    } satisfies Task);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the assignee avatar and name in the footer', () => {
    fixture.componentRef.setInput('task', {
      ...component.task(),
      assignee: {
        id: 'assignee-001' as NonNullable<Task['assignee']>['id'],
        name: 'Alex Morgan',
        avatar: '',
        email: 'alex@example.com',
      },
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.assignee-avatar')
        .textContent.trim(),
    ).toBe('A');
    expect(
      fixture.nativeElement.querySelector('.assignee-name').textContent.trim(),
    ).toBe('@Alex Morgan');
  });

  it('does not show an assignee when the task is unassigned', () => {
    expect(fixture.nativeElement.querySelector('.assignee')).toBeNull();
  });

  it('reserves the description and overdue badge sections when they are empty', () => {
    fixture.componentRef.setInput('task', {
      ...component.task(),
      isOverdue: false,
    });
    fixture.detectChanges();

    const description = fixture.nativeElement.querySelector(
      '.card-description',
    ) as HTMLElement;
    const overdueBadge = fixture.nativeElement.querySelector(
      '.overdue-badge',
    ) as HTMLElement;

    expect(description).toBeTruthy();
    expect(description.textContent.trim()).toBe('');
    expect(overdueBadge).toBeTruthy();
    expect(overdueBadge.textContent.trim()).toBe('');
    expect(overdueBadge.classList).toContain('overdue-badge--hidden');
    expect(overdueBadge.getAttribute('aria-hidden')).toBe('true');
  });

  it('highlights only overdue high-priority tasks', () => {
    const card = (): HTMLElement =>
      fixture.nativeElement.querySelector('.summary-card');

    expect(card().classList).toContain('overdue-critical');

    fixture.componentRef.setInput('task', {
      ...component.task(),
      isOverdue: false,
    });
    fixture.detectChanges();
    expect(card().classList).not.toContain('overdue-critical');

    fixture.componentRef.setInput('task', {
      ...component.task(),
      isOverdue: true,
      priority: 'medium',
    });
    fixture.detectChanges();
    expect(card().classList).not.toContain('overdue-critical');
  });

  it('shows overdue time in days and weeks', () => {
    const daysAgo = (days: number): string => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - days);
      return date.toISOString().slice(0, 10);
    };
    const card = (): HTMLElement =>
      fixture.nativeElement.querySelector('.summary-card');

    fixture.componentRef.setInput('task', {
      ...component.task(),
      dueDate: daysAgo(1),
      isOverdue: true,
    });
    fixture.detectChanges();
    expect(card().querySelector('.overdue-badge')?.textContent?.trim()).toBe(
      'Overdue by 1 day',
    );

    fixture.componentRef.setInput('task', {
      ...component.task(),
      dueDate: daysAgo(8),
      isOverdue: true,
    });
    fixture.detectChanges();
    expect(card().querySelector('.overdue-badge')?.textContent?.trim()).toBe(
      'Overdue by 1 week',
    );
  });

  it('shows when completed tasks were completed', () => {
    const daysAgo = (days: number): string => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - days);
      return date.toISOString();
    };
    const dueDateLabel = (): string =>
      fixture.nativeElement.querySelector('.due-date').textContent.trim();

    fixture.componentRef.setInput('task', {
      ...component.task(),
      status: 'done',
      isOverdue: false,
      completedAt: daysAgo(1),
    });
    fixture.detectChanges();
    expect(dueDateLabel()).toContain('Completed yesterday');

    fixture.componentRef.setInput('task', {
      ...component.task(),
      status: 'done',
      isOverdue: false,
      completedAt: daysAgo(7),
    });
    fixture.detectChanges();
    expect(dueDateLabel()).toContain('Completed 1 week ago');
  });
});
