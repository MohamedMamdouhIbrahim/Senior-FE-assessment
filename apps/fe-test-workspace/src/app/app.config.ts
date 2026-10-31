import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  DomSanitizer,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideAppInitializer(() => registerIcons()),
  ],
};

 // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
 const registerIcons = () => {
  const registry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);

  const icons = [
    'analytics',
    'calender',
    'completed',
    'dashboard-tab',
    'in-progress',
    'notification',
    'overdue',
    'settings-tab',
    'task-manager',
    'tasks-tab',
    'team-tab',
    'total-task',
  ];
  icons.forEach((name) =>
    registry.addSvgIcon(
      name,
      sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${name}.svg`)
    )
  );
}