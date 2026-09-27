import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCompra } from './form-compra';

describe('FormCompra', () => {
  let component: FormCompra;
  let fixture: ComponentFixture<FormCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCompra],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCompra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
