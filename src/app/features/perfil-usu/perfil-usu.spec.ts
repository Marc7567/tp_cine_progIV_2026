import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilUsu } from './perfil-usu';

describe('PerfilUsu', () => {
  let component: PerfilUsu;
  let fixture: ComponentFixture<PerfilUsu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilUsu],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilUsu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
