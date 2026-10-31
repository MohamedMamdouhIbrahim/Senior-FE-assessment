import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map } from 'rxjs';

const NAVIGATION = [
  { label: 'Dashboard', route: '/board', icon: 'dashboard-tab' },
  { label: 'Tasks', route: '/tasks', icon: 'tasks-tab' },
  { label: 'Calender', route: '/calender', icon: 'calender' },
  { label: 'Analytics', route: '/analytics', icon: 'analytics' },
  { label: 'Team', route: '/team', icon: 'team-tab' },
  { label: 'Settings', route: '/settings', icon: 'settings-tab' },
] as const;

const MOBILE_MAX_SIZE = 770; // px
@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly navigation = NAVIGATION;

  protected readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe(`(max-width: ${MOBILE_MAX_SIZE}px)`)
      .pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );

  protected readonly sidenavMode = computed(() => (this.isMobile() ? 'over' : 'side'));


  protected readonly sidenavOpened = linkedSignal(() => !this.isMobile());

  protected toggleSidenav(): void {
    this.sidenavOpened.update((open) => !open);
  }
}