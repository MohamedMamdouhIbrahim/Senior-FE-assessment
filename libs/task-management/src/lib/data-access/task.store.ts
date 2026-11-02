import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import type { Observable } from 'rxjs';
import { map, tap } from 'rxjs';
import { PRIORITIES, STATUSES } from './task-constants';
import type {
  Assignee,
  AssigneeId,
  Task,
  TaskCreate,
  TaskId,
  TaskStatus,
  TaskUpdate,
} from './task.model';

type MockTaskResponse = {
  tasks: Task[];
};

type TaskState = {
  tasks: readonly Task[];
};

const TASKS_URL = 'assets/mock-data/tasks.json';

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState<TaskState>({ tasks: [] }),
  withProps(() => ({
    statuses: STATUSES,
    priorities: PRIORITIES,
  })),
  withComputed(({ tasks }) => ({
    assignees: computed<readonly Assignee[]>(() => {
      const assigneesById = new Map<AssigneeId, Assignee>();
      for (const task of tasks()) {
        if (task.assignee) {
          assigneesById.set(task.assignee.id, task.assignee);
        }
      }
      return [...assigneesById.values()];
    }),
    tags: computed<readonly string[]>(() =>
      [...new Set(tasks().flatMap(({ tags }) => tags))].sort(),
    ),
    tasksByStatus: computed<Record<TaskStatus, readonly Task[]>>(() => {
      const currentTasks = tasks();
      return {
        todo: currentTasks.filter((task) => task.status === 'todo'),
        in_progress: currentTasks.filter(
          (task) => task.status === 'in_progress',
        ),
        done: currentTasks.filter((task) => task.status === 'done'),
      };
    }),
    overdueTasks: computed<readonly Task[]>(() =>
      tasks().filter(({ isOverdue }) => isOverdue),
    ),
  })),
  withMethods((store) => {
    const http = inject(HttpClient);

    const findAssignee = (id: AssigneeId): Assignee => {
      const assignee = store.assignees().find((candidate) => candidate.id === id);
      if (!assignee) {
        throw new Error(`Cannot assign task to unknown assignee "${id}".`);
      }
      return assignee;
    };

    const createTaskId = (): TaskId => {
      const currentTasks = store.tasks();
      const ids = new Set(currentTasks.map(({ id }) => id));
      let sequence =
        currentTasks.reduce((highest, { id }) => {
          const suffix = Number(id.match(/\d+$/)?.[0] ?? 0);
          return Math.max(highest, suffix);
        }, 0) + 1;
      let id = `task-${String(sequence).padStart(3, '0')}` as TaskId;

      while (ids.has(id)) {
        sequence += 1;
        id = `task-${String(sequence).padStart(3, '0')}` as TaskId;
      }

      return id;
    };

    const isTaskOverdue = (dueDate: string, status: TaskStatus): boolean =>
      status !== 'done' && dueDate < new Date().toISOString().slice(0, 10);

    const normalizeTask = (task: Task): Task => ({
      ...task,
      assignee: task.assignee ?? null,
      completedAt: task.completedAt ?? '',
      isOverdue: task.isOverdue ?? isTaskOverdue(task.dueDate, task.status),
      tags: [...task.tags],
    });

    return {
      loadTasks: (): Observable<readonly Task[]> =>
        http.get<MockTaskResponse>(TASKS_URL).pipe(
          map(({ tasks }) => tasks.map(normalizeTask)),
          tap((tasks) => patchState(store, { tasks })),
        ),

      getTask: (id: TaskId): Task | undefined =>
        store.tasks().find((task) => task.id === id),

      addTask: (taskToCreate: TaskCreate): Task => {
        const now = new Date().toISOString();
        const { assigneeId, ...taskFields } = taskToCreate;
        const task: Task = {
          ...taskFields,
          id: createTaskId(),
          assignee: assigneeId ? findAssignee(assigneeId) : null,
          completedAt: taskToCreate.status === 'done' ? now : '',
          isOverdue: isTaskOverdue(taskToCreate.dueDate, taskToCreate.status),
          createdAt: now,
          updatedAt: now,
        };

        patchState(store, ({ tasks }) => ({ tasks: [task, ...tasks] }));
        return task;
      },

      updateTask: (id: TaskId, changes: TaskUpdate): Task | undefined => {
        const existingTask = store.tasks().find((task) => task.id === id);
        if (!existingTask) {
          return undefined;
        }

        const { assigneeId, ...taskChanges } = changes;
        const updatedTask: Task = {
          ...existingTask,
          ...taskChanges,
          ...(assigneeId !== undefined
            ? {
                assignee:
                  assigneeId === null ? null : findAssignee(assigneeId),
              }
            : {}),
          completedAt:
            taskChanges.completedAt ??
            (taskChanges.status === 'done' && existingTask.status !== 'done'
              ? new Date().toISOString()
              : taskChanges.status && taskChanges.status !== 'done'
                ? ''
                : existingTask.completedAt),
          isOverdue: isTaskOverdue(
            taskChanges.dueDate ?? existingTask.dueDate,
            taskChanges.status ?? existingTask.status,
          ),
          updatedAt: new Date().toISOString(),
        };

        patchState(store, ({ tasks }) => ({
          tasks: tasks.map((task) => (task.id === id ? updatedTask : task)),
        }));
        return updatedTask;
      },

      deleteTask: (id: TaskId): boolean => {
        const currentTasks = store.tasks();
        if (!currentTasks.some((task) => task.id === id)) {
          return false;
        }

        patchState(store, {
          tasks: currentTasks.filter((task) => task.id !== id),
        });
        return true;
      },

      reorderTasksInColumn: (
        status: TaskStatus,
        movedTaskId: TaskId,
        targetIndex: number,
      ): void => {
        const currentTasks = [...store.tasks()];
        const columnTasks = currentTasks.filter((t) => t.status === status);

        const movedIdx = columnTasks.findIndex((t) => t.id === movedTaskId);
        if (movedIdx === -1) return;

        // Splice the task out then insert at target position
        const [movedTask] = columnTasks.splice(movedIdx, 1);
        columnTasks.splice(targetIndex, 0, movedTask);

        // Rebuild full tasks array preserving order of other-status tasks
        let colPointer = 0;
        const reordered = currentTasks.map((task) =>
          task.status === status ? columnTasks[colPointer++] : task,
        );

        patchState(store, { tasks: reordered });
      },
    };
  }),
);
