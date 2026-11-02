import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'board',
  },
  {
    path: 'board',
    title: 'Kanban board',
    loadComponent: () =>
      import('@fe-test-workspace/task-management/lib/features/kanban-board/kanban-board').then(
        (module) => module.KanbanBoard,
      ),
  },
  {
    path: 'analytics',
    title: 'Analytics',
    loadComponent: () =>
      import('@fe-test-workspace/analytics/lib/analytics/analytics').then(
        (module) => module.Analytics,
      ),
  },
  {
    path: 'team',
    title: 'Team',
    loadComponent: () =>
      import('@fe-test-workspace/team-mangement/lib/team-mangement/team-mangement').then(
        (module) => module.TeamMangement,
      ),
  },
  {
    path: 'settings',
    title: 'Settings',
    loadComponent: () =>
      import('@fe-test-workspace/settings/lib/settings/settings').then(
        (module) => module.Settings,
      ),
  },
  {
    path: '**',
    redirectTo: 'board',
  },
];
