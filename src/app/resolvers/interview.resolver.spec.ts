import { TestBed } from '@angular/core/testing';

import { InterviewResolver } from './interview.resolver';

describe('InterviewResolver', () => {
  let resolver: InterviewResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(InterviewResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
