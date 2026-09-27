import { TestBed } from '@angular/core/testing';
import { CandyBarService } from './candyBar-service';

describe('CandyBarService', () => {
  let service: CandyBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandyBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
