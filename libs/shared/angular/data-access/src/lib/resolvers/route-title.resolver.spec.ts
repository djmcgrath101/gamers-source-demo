import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideMockAppConfig } from '@gamers-source/shared-angular-testing';
import { routeTitleResolver } from './route-title.resolver';

@Component({ template: '', standalone: true })
class TestComponent {
  readonly title = inject(Title);
}

describe('routeTitleResolver', () => {
  let component: TestComponent;

  it('generates a route title using both the app name and route title', async () => {
    await setupTest({ title: 'Test Route' });

    expect(component.title.getTitle()).toBe('Test Application - Test Route');
  });

  it('generates a route title with only the app name when no route title is present', async () => {
    await setupTest();

    expect(component.title.getTitle()).toBe('Test Application');
  });

  it('generates a route title with only the app name when the route title is empty', async () => {
    await setupTest({ title: '' });

    expect(component.title.getTitle()).toBe('Test Application');
  });

  async function setupTest(data: object = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        provideMockAppConfig({ name: 'Test Application' }),
        provideRouter([
          {
            path: 'test',
            component: TestComponent,
            data,
            title: routeTitleResolver
          }
        ])
      ]
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigate(['test']);

    const fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }
});
