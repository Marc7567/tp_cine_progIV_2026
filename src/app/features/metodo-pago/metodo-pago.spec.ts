import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetodoPago } from './metodo-pago';

describe('MetodoPago', () => {
  let component: MetodoPago;
  let fixture: ComponentFixture<MetodoPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetodoPago],
    }).compileComponents();

    fixture = TestBed.createComponent(MetodoPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
