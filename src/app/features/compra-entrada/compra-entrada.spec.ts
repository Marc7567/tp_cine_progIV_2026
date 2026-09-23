import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompraEntrada } from './compra-entrada';

describe('CompraEntrada', () => {
  let component: CompraEntrada;
  let fixture: ComponentFixture<CompraEntrada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraEntrada],
    }).compileComponents();

    fixture = TestBed.createComponent(CompraEntrada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
