import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgLazyCache } from './ng-lazy-cache';

describe('NgLazyCache', () => {
  let component: NgLazyCache;
  let fixture: ComponentFixture<NgLazyCache>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgLazyCache]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgLazyCache);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
