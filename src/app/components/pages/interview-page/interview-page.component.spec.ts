import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPageComponent } from './interview-page.component';

describe('InterviewPageComponent', () => {
  let component: InterviewPageComponent;
  let fixture: ComponentFixture<InterviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
