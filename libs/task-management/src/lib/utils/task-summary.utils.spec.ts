import type { Task } from '../data-access/models/task.model';
import { getTaskSummaryDetails } from './task-summary.utils';

describe('getTaskSummaryDetails', () => {
  it('calculates date-based details using the supplied current date', () => {
    const createTask = (
      id: string,
      status: Task['status'],
      createdAt: string,
      dueDate: string,
      completedAt = '',
    ): Task => ({
      id: id as Task['id'],
      title: id,
      description: '',
      status,
      priority: 'medium',
      dueDate,
      isOverdue: false,
      completedAt,
      assignee: null,
      tags: [],
      createdAt,
      updatedAt: createdAt,
    });

    const tasks = [
      createTask(
        'completed-today',
        'done',
        '2026-11-04T10:00:00.000Z',
        '2026-11-04',
        '2026-11-04T12:00:00.000Z',
      ),
      createTask(
        'created-this-week',
        'todo',
        '2026-11-02T10:00:00.000Z',
        '2026-11-04',
      ),
      createTask(
        'created-today',
        'in_progress',
        '2026-11-04T10:00:00.000Z',
        '2026-11-04',
      ),
      createTask(
        'created-last-week',
        'todo',
        '2026-11-01T10:00:00.000Z',
        '2026-11-03',
      ),
      createTask(
        'completed-before-today',
        'done',
        '2026-11-03T10:00:00.000Z',
        '2026-11-04',
        '2026-11-03T12:00:00.000Z',
      ),
    ];

    expect(getTaskSummaryDetails(tasks, new Date(2026, 10, 4))).toEqual({
      createdThisWeek: '+4 this week',
      completedToday: '1 today',
      dueToday: '2 due today',
    });
  });
});
