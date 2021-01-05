import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedToComponent } from './connected-to.component';

describe('ConnectedToComponent', () => {
  let component: ConnectedToComponent;
  let fixture: ComponentFixture<ConnectedToComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectedToComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
