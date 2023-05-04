import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFollowStatusComponent } from './user-follow-status.component';

describe('UserFollowStatusComponent', () => {
  let component: UserFollowStatusComponent;
  let fixture: ComponentFixture<UserFollowStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserFollowStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFollowStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
