import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styles: `
    .badge {
      @apply px-3 py-1 rounded-full text-sm font-medium;
    }
    .badge-warning {
      @apply bg-amber-100 text-amber-800;
    }
    .badge-success {
      @apply bg-green-soft text-green;
    }
    .badge-gray {
      @apply bg-gray-100 text-gray-800;
    }
    .badge-orange {
      @apply bg-orange-100 text-orange-800;
    }
  `
})
export class UiBadgeComponent {
  variant = input<'warning' | 'success' | 'gray' | 'orange'>('warning');

  get badgeClasses(): string {
    const baseClasses = 'badge';
    const variantClasses = {
      warning: 'badge-warning',
      success: 'badge-success',
      gray: 'badge-gray',
      orange: 'badge-orange'
    };
    return `${baseClasses} ${variantClasses[this.variant()]}`;
  }
}
