import type { Task } from '../data-access/models/task.model';

export type TaskSummaryDetails = {
  createdThisWeek: string;
  completedToday: string;
  dueToday: string;
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeekKey(today: Date): string {
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);
  return localDateKey(monday);
}

function dateKey(value: string): string {
  return value.slice(0, 10);
}

export function getTaskSummaryDetails(
  tasks: readonly Task[],
  now: Date,
): TaskSummaryDetails {
  const today = localDateKey(now);
  const weekStart = startOfWeekKey(now);
  const activeTasks = tasks.filter((task) => task.status !== 'done');
  const createdThisWeek = tasks.filter((task) => {
    const createdDate = dateKey(task.createdAt);
    return createdDate >= weekStart && createdDate <= today;
  }).length;
  const completedToday = tasks.filter(
    (task) =>
      task.status === 'done' &&
      task.completedAt &&
      dateKey(task.completedAt) === today,
  ).length;
  const dueToday = activeTasks.filter(
    (task) => dateKey(task.dueDate) === today,
  ).length;

  return {
    createdThisWeek: `+${createdThisWeek} this week`,
    completedToday: `${completedToday} today`,
    dueToday: `${dueToday} due today`,
  };
}
