import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedNoticessPageComponent } from './feed-noticess-page.component';

describe('FeedNoticessPageComponent', () => {
  let component: FeedNoticessPageComponent;
  let fixture: ComponentFixture<FeedNoticessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedNoticessPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedNoticessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
