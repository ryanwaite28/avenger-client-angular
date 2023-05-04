import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewIntervieweeRatingsPageComponent } from './interview-interviewee-ratings-page.component';

describe('InterviewIntervieweeRatingsPageComponent', () => {
  let component: InterviewIntervieweeRatingsPageComponent;
  let fixture: ComponentFixture<InterviewIntervieweeRatingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewIntervieweeRatingsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewIntervieweeRatingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
