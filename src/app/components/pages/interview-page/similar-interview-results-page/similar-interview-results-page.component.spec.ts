import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarInterviewResultsPageComponent } from './similar-interview-results-page.component';

describe('SimilarInterviewResultsPageComponent', () => {
  let component: SimilarInterviewResultsPageComponent;
  let fixture: ComponentFixture<SimilarInterviewResultsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimilarInterviewResultsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarInterviewResultsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
