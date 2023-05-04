import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewCommentsPageComponent } from './interview-comments-page.component';

describe('InterviewCommentsPageComponent', () => {
  let component: InterviewCommentsPageComponent;
  let fixture: ComponentFixture<InterviewCommentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewCommentsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewCommentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
