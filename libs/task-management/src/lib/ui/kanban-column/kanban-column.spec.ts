import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanColumn } from './kanban-column';

describe('KanbanColumn', () => {
  let component: KanbanColumn;
  let fixture: ComponentFixture<KanbanColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanColumn],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanColumn);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columnTitle', 'To Do');
    fixture.componentRef.setInput('columnStatus', 'todo');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
