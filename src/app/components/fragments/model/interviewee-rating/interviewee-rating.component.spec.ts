import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervieweeRatingComponent } from './interviewee-rating.component';

describe('IntervieweeRatingComponent', () => {
  let component: IntervieweeRatingComponent;
  let fixture: ComponentFixture<IntervieweeRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntervieweeRatingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntervieweeRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
