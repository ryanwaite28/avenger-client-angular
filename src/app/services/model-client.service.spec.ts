import { TestBed } from '@angular/core/testing';

import { ModelClientService } from './model-client.service';

describe('ModelClientService', () => {
  let service: ModelClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
