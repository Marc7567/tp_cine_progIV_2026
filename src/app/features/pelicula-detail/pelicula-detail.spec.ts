import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeliculaDetail } from './pelicula-detail';

describe('PeliculaDetail', () => {
  let component: PeliculaDetail;
  let fixture: ComponentFixture<PeliculaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeliculaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PeliculaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
