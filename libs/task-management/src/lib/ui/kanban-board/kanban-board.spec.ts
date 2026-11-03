import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanBoardUi } from './kanban-board';

describe('KanbanBoard', () => {
  let component: KanbanBoard;
  let fixture: ComponentFixture<KanbanBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanBoardUi],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
