import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import type { TaskStore as TaskStoreType } from '@fe-test-workspace/task-management/lib/data-access';
import type { Task } from '@fe-test-workspace/task-management/lib/data-access/models/task.model';
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
    NgOptimizedImage,
    MatButtonModule,
    MatDialogModule,
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
  protected readonly searchQuery = signal('');
  protected readonly isSearchOpen = signal(false);
  protected readonly activeSearchResultIndex = signal(-1);
  private readonly searchTasks = signal<readonly Task[]>([]);
  protected readonly searchResults = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();
    if (!query) {
      return [];
    }

    return this.searchTasks()
      .filter((task) =>
        [task.title, task.description, ...task.tags].some((value) =>
          value.toLocaleLowerCase().includes(query),
        ),
      )
      .slice(0, 5);
  });

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

  protected updateSearchQuery(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.searchQuery.set(target.value);
    this.activeSearchResultIndex.set(-1);
    this.isSearchOpen.set(true);
    if (target.value.trim()) {
      void this.getTaskStore().then((taskStore) =>
        this.searchTasks.set(taskStore.tasks()),
      );
    }
  }

  protected handleSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (!this.isSearchOpen() || !results.length) {
      if (event.key === 'Escape') {
        this.isSearchOpen.set(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSearchResultIndex.update((index) =>
        Math.min(index + 1, results.length - 1),
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSearchResultIndex.update((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selectedIndex = Math.max(this.activeSearchResultIndex(), 0);
      this.selectSearchResult(results[selectedIndex]);
    } else if (event.key === 'Escape') {
      this.isSearchOpen.set(false);
    }
  }

  protected selectSearchResult(task: Task): void {
    this.searchQuery.set('');
    this.isSearchOpen.set(false);
    this.activeSearchResultIndex.set(-1);

    void Promise.all([
      import(
        '@fe-test-workspace/task-management/lib/features/edit-task/edit-task'
      ),
      this.getTaskStore(),
    ]).then(([{ EditTask }, taskStore]) => {
      const dialogRef = this.dialog.open(EditTask, {
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100dvh - 32px)',
      });
      dialogRef.componentRef?.setInput('task', task);
      dialogRef.componentRef?.setInput('assignees', [...taskStore.assignees()]);

      dialogRef.componentInstance.taskUpdated.subscribe((changes) => {
        taskStore.updateTask(task.id, changes);
        dialogRef.close();
      });
      dialogRef.componentInstance.cancelled.subscribe(() => {
        dialogRef.close();
      });
    });
  }

  protected openCreateTaskDialog(): void {
    void Promise.all([
      import('@fe-test-workspace/shared/ui/create-task/create-task'),
      this.getTaskStore(),
    ]).then(([{ CreateTaskForm }, taskStore]) => {
      const dialogRef = this.dialog.open(CreateTaskForm, {
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100dvh - 32px)',
      });
      dialogRef.componentRef?.setInput('assignees', [...taskStore.assignees()]);

      dialogRef.componentInstance.taskCreated.subscribe((task) => {
        taskStore.addTask(task);
        dialogRef.close();
      });
      dialogRef.componentInstance.cancelled.subscribe(() => dialogRef.close());
    });
  }

  private async getTaskStore(): Promise<InstanceType<typeof TaskStoreType>> {
    const { TaskStore } = await import(
      '@fe-test-workspace/task-management/lib/data-access'
    );
    return this.injector.get(TaskStore);
  }
}
