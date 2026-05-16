import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [],
  template: `
    <div class="flex flex-col">
      <h1>Page not found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  `,
  styles: [
    `
      :host {
        @apply flex-center fill-space;

        h1,
        p {
          @apply text-center;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFoundView {}
