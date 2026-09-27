import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-iot',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main class="relative min-h-screen overflow-hidden bg-cream">
      <header class="relative z-10 flex items-center gap-3 border-b border-line bg-white px-6 py-4">
        <img src="/logo.png" alt="" class="h-14 w-14 object-contain">
        <span class="font-serif text-3xl font-bold text-wine">BioConversion</span>
      </header>

      <section class="sensor-preview" aria-hidden="true">
        <article class="sensor-card">
          <span class="sensor-icon">♨</span><span>Température de la serre :</span><strong>28,4 °C</strong>
        </article>
        <article class="sensor-card">
          <span class="sensor-icon">◉</span><span>Humidité de la serre :</span><strong>62 %</strong>
        </article>
      </section>

      <div class="pause-overlay"></div>
      <section class="pause-card">
        <div class="lock-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM10 7a2 2 0 1 1 4 0v2h-4V7Zm2 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/>
          </svg>
        </div>
        <h1>Module IoT &amp; Télémétrie</h1>
        <p>Ce module est en pause. Son activation attend une consigne explicite du chef de projet — aucune date n’est encore fixée.</p>
        <span class="pause-badge"><span aria-hidden="true">⌁</span> Branche gelée · Module A</span>
        <a routerLink="/dashboard/producteur" class="back-link">← Retour au tableau de bord</a>
      </section>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100svh; }
    .sensor-preview { position: absolute; inset: 105px 4% auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; filter: blur(2px); opacity: .55; }
    .sensor-card { min-height: 155px; display: grid; grid-template-columns: 90px 1fr; align-content: center; align-items: center; gap: 0 18px; border: 1px solid #ddd9cd; border-radius: 14px; background: white; padding: 22px; color: #59636a; font-size: 17px; }
    .sensor-card strong { grid-column: 2; color: #4e7d3f; font-size: 32px; }
    .sensor-icon { grid-row: 1 / 3; width: 76px; height: 76px; display: grid; place-items: center; border-radius: 50%; background: #e8f0df; color: #4e7d3f; font-size: 40px; }
    .pause-overlay { position: absolute; inset: 80px 0 0; background: #f7f4eab8; backdrop-filter: blur(4px); }
    .pause-card { position: relative; z-index: 2; width: min(100% - 32px, 1000px); margin: 205px auto 40px; border: 1px solid #e3e3dc; border-radius: 22px; background: white; padding: 42px 32px; text-align: center; box-shadow: 0 16px 44px #3f08201c; }
    .lock-icon { width: 106px; height: 106px; display: grid; place-items: center; margin: 0 auto 22px; border-radius: 50%; background: #e8f0df; color: #3f6c37; }
    .lock-icon svg { width: 52px; height: 52px; }
    .pause-card h1 { margin: 0; color: #64102f; font: 700 clamp(28px, 3.8vw, 48px)/1.2 Georgia, serif; }
    .pause-card p { max-width: 760px; margin: 22px auto 28px; color: #68717a; font-size: clamp(16px, 1.8vw, 22px); line-height: 1.6; }
    .pause-badge { display: inline-flex; align-items: center; gap: 9px; border-radius: 999px; background: #f0f1f1; padding: 10px 20px; color: #59636a; font-size: 16px; }
    .back-link { display: block; max-width: 630px; margin: 38px auto 0; border: 1px solid #64102f; border-radius: 12px; padding: 17px; color: #64102f; font-size: 18px; font-weight: 600; text-decoration: none; }
    .back-link:hover, .back-link:focus-visible { background: #f7f4ea; }
    @media (max-width: 700px) { .sensor-preview { grid-template-columns: 1fr; inset: 96px 16px auto; gap: 10px; } .sensor-card { min-height: 108px; grid-template-columns: 58px 1fr; font-size: 14px; padding: 14px; } .sensor-icon { width: 48px; height: 48px; font-size: 28px; } .sensor-card strong { font-size: 22px; } .pause-card { margin-top: 200px; padding: 30px 20px; } }
  `
})
export class IotComponent {}
