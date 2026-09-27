import { Component, input, output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled()"
      (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: `
    .btn {
      @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
    .btn-primary {
      @apply bg-wine text-white hover:bg-wine-dark;
    }
    .btn-secondary {
      @apply border-2 border-wine text-wine hover:bg-wine hover:text-white;
    }
    .btn-success {
      @apply bg-green text-white hover:opacity-80;
    }
    .btn:disabled {
      @apply opacity-50 cursor-not-allowed;
    }
  `
})
export class UiButtonComponent {
  variant = input<'primary' | 'secondary' | 'success'>('primary');
  disabled = input(false);
  onClick = output<MouseEvent>();

  get buttonClasses(): string {
    const baseClasses = 'btn';
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      success: 'btn-success'
    };
    return `${baseClasses} ${variantClasses[this.variant()]}`;
  }
}
