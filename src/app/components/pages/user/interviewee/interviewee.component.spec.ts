import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervieweeComponent } from './interviewee.component';

describe('IntervieweeComponent', () => {
  let component: IntervieweeComponent;
  let fixture: ComponentFixture<IntervieweeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntervieweeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntervieweeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
