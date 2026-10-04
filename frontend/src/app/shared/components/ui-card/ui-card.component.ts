import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-white rounded-2xl shadow-sm p-6">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .card {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    }
  `
})
export class UiCardComponent {}
