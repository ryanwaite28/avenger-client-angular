import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewCommentComponent } from './interview-comment.component';

describe('InterviewCommentComponent', () => {
  let component: InterviewCommentComponent;
  let fixture: ComponentFixture<InterviewCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewCommentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
