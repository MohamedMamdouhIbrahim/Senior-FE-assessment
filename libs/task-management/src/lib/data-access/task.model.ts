export type Task = {
  id: TaskId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  completedAt: string;
  assignee: Assignee | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskCreate = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'assignee'
> & {
  assigneeId?: NonNullable<Task['assignee']>['id'];
};
export type TaskUpdate = Partial<
  Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'assignee'>
> & {
  assigneeId?: NonNullable<Task['assignee']>['id'] | null;
};
export type TaskId = string & { readonly __brand: 'TaskId' };

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type Assignee = {
  id: AssigneeId;
  name: string;
  avatar: string;
  email: string;
};
export type AssigneeId = string & { readonly __brand: 'AssigneeId' };
