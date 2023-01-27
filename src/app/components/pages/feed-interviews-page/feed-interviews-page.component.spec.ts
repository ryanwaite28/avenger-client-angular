import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedInterviewsPageComponent } from './feed-interviews-page.component';

describe('FeedInterviewsPageComponent', () => {
  let component: FeedInterviewsPageComponent;
  let fixture: ComponentFixture<FeedInterviewsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedInterviewsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedInterviewsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
