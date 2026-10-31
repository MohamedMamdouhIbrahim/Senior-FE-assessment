export type Task = {
  id: TaskId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  completedAt: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskCreate = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

export type TaskId = string & { readonly __brand: 'TaskId' };

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
type Assignee = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};
