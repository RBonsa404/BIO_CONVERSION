import { Component } from '@angular/core';

@Component({
  selector: 'app-iot',
  standalone: true,
  template: `
    <div class="min-h-screen bg-cream flex items-center justify-center p-8">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2h.2z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-serif text-wine font-bold mb-2">Module IoT</h1>
        <p class="text-text mb-4">Module en cours de développement</p>
        <p class="font-script text-green text-lg italic mb-6">À venir</p>
        <span class="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
          Verrouillé
        </span>
      </div>
    </div>
  `
})
export class IotComponent {}
