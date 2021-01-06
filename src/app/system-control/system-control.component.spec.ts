import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemControlComponent } from './system-control.component';

describe('SystemControlComponent', () => {
  let component: SystemControlComponent;
  let fixture: ComponentFixture<SystemControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
