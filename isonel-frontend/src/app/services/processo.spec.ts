import { TestBed } from '@angular/core/testing';

import { Processo } from './processo';

describe('Processo', () => {
  let service: Processo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Processo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
