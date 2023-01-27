import { TestBed } from '@angular/core/testing';

import { NoticeResolver } from './notice.resolver';

describe('NoticeResolver', () => {
  let resolver: NoticeResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(NoticeResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
