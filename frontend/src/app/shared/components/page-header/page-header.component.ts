import { Component, input } from '@angular/core';

/** En-tête commun des pages de l'espace connecté. */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="mb-6 flex flex-wrap items-center gap-4 border-b border-line pb-5">
      <div class="min-w-0 flex-1">
        @if (surtitre()) {
          <p class="text-sm font-semibold uppercase tracking-wide text-green">{{ surtitre() }}</p>
        }
        <h1 class="font-serif text-2xl font-bold text-wine md:text-4xl">{{ titre() }}</h1>
        @if (sousTitre()) {
          <p class="mt-1 text-text">{{ sousTitre() }}</p>
        }
      </div>
      <ng-content></ng-content>
    </header>
  `
})
export class PageHeaderComponent {
  titre = input.required<string>();
  sousTitre = input('');
  surtitre = input('');
}
