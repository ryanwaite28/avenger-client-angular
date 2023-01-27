import { TestBed } from '@angular/core/testing';

import { QuestionResolver } from './question.resolver';

describe('QuestionResolver', () => {
  let resolver: QuestionResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(QuestionResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
