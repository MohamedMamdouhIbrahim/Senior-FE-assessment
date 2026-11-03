import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  linkedSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
    MatDialogModule,
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
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

  protected readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe(`(max-width: ${MOBILE_MAX_SIZE}px)`)
      .pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );

  protected readonly sidenavMode = computed(() =>
    this.isMobile() ? 'over' : 'side',
  );

  protected readonly sidenavOpened = linkedSignal(() => !this.isMobile());

  protected toggleSidenav(): void {
    this.sidenavOpened.update((open) => !open);
  }

  //since task magagemnt is a lazy loaded lib but we need add task in the layout so 
  // we lazy load the component and the store here not direct import
  protected openCreateTaskDialog(): void {
    Promise.all([
      import(
        '@fe-test-workspace/task-management/lib/features/create-task/create-task'
      ),
      import('@fe-test-workspace/task-management/lib/data-access/task.store'),
    ]).then(([{ CreateTask }, { TaskStore }]) => {
      const taskStore = this.injector.get(TaskStore);
      const dialogRef = this.dialog.open(CreateTask, {
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100dvh - 32px)',
      });

      dialogRef.componentInstance.taskCreated.subscribe((task) => {
        taskStore.addTask(task);
        dialogRef.close();
      });
      dialogRef.componentInstance.cancelled.subscribe(() => dialogRef.close());
    });
  }
}
