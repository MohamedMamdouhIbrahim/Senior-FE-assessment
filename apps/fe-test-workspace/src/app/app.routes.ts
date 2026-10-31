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
      import('@fe-test-workspace/task-management/kanban-board').then(
        (module) => module.KanbanBoard,
      ),
  },
  {
    path: 'analytics',
    title: 'Analytics',
    loadComponent: () =>
      import('@fe-test-workspace/analytics').then(
        (module) => module.Analytics,
      ),
  },
  {
    path: 'team',
    title: 'Team',
    loadComponent: () =>
      import('@fe-test-workspace/team-mangement').then(
        (module) => module.TeamMangement,
      ),
  },
  {
    path: 'settings',
    title: 'Settings',
    loadComponent: () =>
      import('@fe-test-workspace/settings').then(
        (module) => module.Settings,
      ),
  },
  {
    path: '**',
    redirectTo: 'board',
  },
];
