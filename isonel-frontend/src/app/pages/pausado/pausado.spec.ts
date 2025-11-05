import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pausado } from './pausado';

describe('Pausado', () => {
  let component: Pausado;
  let fixture: ComponentFixture<Pausado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pausado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pausado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
