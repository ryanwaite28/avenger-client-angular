import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerPageComponent } from './answer-page.component';

describe('AnswerPageComponent', () => {
  let component: AnswerPageComponent;
  let fixture: ComponentFixture<AnswerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
