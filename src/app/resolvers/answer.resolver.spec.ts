import { TestBed } from '@angular/core/testing';

import { AnswerResolver } from './answer.resolver';

describe('AnswerResolver', () => {
  let resolver: AnswerResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AnswerResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
