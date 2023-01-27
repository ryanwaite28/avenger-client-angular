import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewCommentReplyComponent } from './interview-comment-reply.component';

describe('InterviewCommentReplyComponent', () => {
  let component: InterviewCommentReplyComponent;
  let fixture: ComponentFixture<InterviewCommentReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewCommentReplyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewCommentReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
