import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewerRatingComponent } from './interviewer-rating.component';

describe('InterviewerRatingComponent', () => {
  let component: InterviewerRatingComponent;
  let fixture: ComponentFixture<InterviewerRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewerRatingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewerRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
