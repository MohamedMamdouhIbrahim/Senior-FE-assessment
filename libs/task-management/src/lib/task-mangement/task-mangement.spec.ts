import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskMangement } from './task-mangement';

describe('TaskMangement', () => {
  let component: TaskMangement;
  let fixture: ComponentFixture<TaskMangement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskMangement],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskMangement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
