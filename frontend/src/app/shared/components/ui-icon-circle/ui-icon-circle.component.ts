import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-icon-circle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="circleClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .icon-circle {
      @apply w-12 h-12 rounded-full flex items-center justify-center;
    }
    .icon-circle-green {
      @apply bg-green-soft;
    }
    .icon-circle-wine {
      @apply bg-green-soft;
    }
  `
})
export class UiIconCircleComponent {
  color = input<'green' | 'wine'>('green');

  get circleClasses(): string {
    const baseClasses = 'icon-circle';
    const colorClasses = {
      green: 'icon-circle-green',
      wine: 'icon-circle-wine'
    };
    return `${baseClasses} ${colorClasses[this.color()]}`;
  }
}
