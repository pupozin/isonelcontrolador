import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finalizado } from './finalizado';

describe('Finalizado', () => {
  let component: Finalizado;
  let fixture: ComponentFixture<Finalizado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finalizado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finalizado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
