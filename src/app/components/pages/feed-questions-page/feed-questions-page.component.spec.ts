import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedQuestionsPageComponent } from './feed-questions-page.component';

describe('FeedQuestionsPageComponent', () => {
  let component: FeedQuestionsPageComponent;
  let fixture: ComponentFixture<FeedQuestionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedQuestionsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedQuestionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
