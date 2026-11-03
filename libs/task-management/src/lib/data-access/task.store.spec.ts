import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { AssigneeId, TaskCreate, TaskId } from './models/task.model';
import { TaskStore } from './task.store';

describe('TaskStore', () => {
  let store: InstanceType<typeof TaskStore>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(TaskStore);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('initializes with mock tasks before a client request', () => {
    expect(store.tasks()).toHaveLength(17);
    httpTestingController.expectNone('assets/mock-data/tasks.json');
  });

  it('loads mock tasks and keeps computed data in sync with CRUD changes', () => {
    store.loadTasks().subscribe();
    httpTestingController
      .expectOne('assets/mock-data/tasks.json')
      .flush({
        tasks: [
          {
            id: 'task-001',
            title: 'Initial task',
            description: 'Existing task from mock data',
            status: 'todo',
            priority: 'medium',
            dueDate: '2099-01-01',
            assignee: {
              id: 'user-001',
              name: 'John Doe',
              avatar: 'JD',
              email: 'john.doe@company.com',
            },
            tags: ['Design'],
            createdAt: '2026-10-29T12:15:20.769Z',
            updatedAt: '2026-10-31T13:15:20.769Z',
          },
        ],
      });

    expect(store.tasks()).toHaveLength(1);
    expect(store.tasks()[0].completedAt).toBe('');
    expect(store.assignees()).toHaveLength(1);
    expect(store.tags()).toEqual(['Design']);

    const taskToCreate: TaskCreate = {
      title: 'New task',
      description: 'Task created in memory',
      status: 'todo',
      priority: 'high',
      dueDate: '2099-02-01',
      isOverdue: false,
      tags: ['Review'],
      assigneeId: 'user-001' as AssigneeId,
    };
    const createdTask = store.addTask(taskToCreate);

    expect(createdTask.id).toBe('task-002' as TaskId);
    expect(store.tasks()).toHaveLength(2);
    expect(store.tags()).toEqual(['Design', 'Review']);

    const updatedTask = store.updateTask(createdTask.id, {
      status: 'done',
      tags: ['Completed'],
    });

    expect(updatedTask?.completedAt).toBeTruthy();
    expect(store.tasksByStatus().done).toEqual([updatedTask]);
    expect(store.tags()).toEqual(['Completed', 'Design']);
    expect(store.deleteTask(createdTask.id)).toBe(true);
    expect(store.tasks()).toHaveLength(1);
    expect(store.tags()).toEqual(['Design']);
    expect(store.deleteTask(createdTask.id)).toBe(false);
  });
});
