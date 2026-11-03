import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('should render workspace navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Tasks');
    expect(compiled.textContent).toContain('Analytics');
    expect(compiled.textContent).toContain('Team');
    expect(compiled.textContent).toContain('Settings');
  });

  it('should render the task search and user actions in the toolbar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-brand')).toBeNull();
    expect(compiled.querySelector('.app-toolbar')).not.toBeNull();
    expect(
      (compiled.querySelector('#task-search-input') as HTMLInputElement)
        .placeholder,
    ).toBe('Search tasks...');
    expect(
      compiled.querySelector('[aria-label="Notifications"]'),
    ).not.toBeNull();
    expect(compiled.querySelector('.user-avatar')?.textContent).toBe('JJ');
  });

  it('limits autocomplete to five tasks and opens the selected task for editing', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '#task-search-input',
    ) as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await expect
      .poll(() => {
        fixture.detectChanges();
        return fixture.nativeElement.querySelectorAll('.search-result').length;
      })
      .toBe(5);
    const results = fixture.nativeElement.querySelectorAll('.search-result');

    (results[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    await expect
      .poll(() => document.body.querySelector('task-management-edit-task'))
      .not.toBeNull();
  });
});
