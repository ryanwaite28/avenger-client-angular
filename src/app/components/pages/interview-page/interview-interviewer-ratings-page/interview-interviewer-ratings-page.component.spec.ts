import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewInterviewerRatingsPageComponent } from './interview-interviewer-ratings-page.component';

describe('InterviewInterviewerRatingsPageComponent', () => {
  let component: InterviewInterviewerRatingsPageComponent;
  let fixture: ComponentFixture<InterviewInterviewerRatingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewInterviewerRatingsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewInterviewerRatingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
