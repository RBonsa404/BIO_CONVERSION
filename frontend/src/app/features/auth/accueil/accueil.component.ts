import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type Profile = 'producteur' | 'eleveur';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="home-shell">
      <section class="home-main" aria-label="Bienvenue sur BioConversion">
        <header class="brand">
          <img src="/logo.png" alt="Emblème BioConversion" class="brand-mark">
          <div>
            <h1 class="brand-name">BioConversion</h1>
            <p class="brand-description">Production de larves de mouches soldats noires</p>
            <p class="brand-tagline">Une agriculture durable, une alimentation de qualité</p>
          </div>
        </header>

        <div class="home-content">
          <div class="welcome">
            <div class="leaf-rule" aria-hidden="true"><span>❧</span></div>
            <h2>Bienvenue sur<br><strong>BioConversion</strong></h2>
            <p>Connectez-vous pour accéder à la plateforme<br class="desktop-break"> de bio-conversion par larves de mouches soldats noires.</p>
          </div>

          <section class="profile-section" aria-labelledby="profile-title">
            <h3 id="profile-title">Choisissez votre profil</h3>
            <div class="profile-cards">
              <button type="button" class="profile-card" (click)="selectProfile('producteur')">
                <span class="profile-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 24v16m0-16c-9 0-13-5-13-13 8 0 13 4 13 13Zm0-4c0-8 4-13 13-13 0 8-4 13-13 13Z" />
                    <path d="M8 35c5-6 11-7 16-4 5-3 11-2 16 4l-4 4H12l-4-4Z" />
                    <path d="M15 37h18" />
                  </svg>
                </span>
                <span class="profile-label">Producteur</span>
                <span class="profile-hint">Je vends mes larves</span>
                <span class="profile-arrow" aria-hidden="true">→</span>
              </button>

              <button type="button" class="profile-card" (click)="selectProfile('eleveur')">
                <span class="profile-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M6 22c4-2 8-5 11-8l19 2 7 6-7 7-18 1-12-8Z" />
                    <circle cx="36" cy="20" r="1.5" />
                    <path d="M10 35c5-3 10-3 15 0s10 3 15 0m-30 5c5-3 10-3 15 0s10 3 15 0" />
                  </svg>
                </span>
                <span class="profile-label">Éleveur — Pisciculteur</span>
                <span class="profile-hint">J’achète des larves</span>
                <span class="profile-arrow" aria-hidden="true">→</span>
              </button>

              <button type="button" class="profile-card" (click)="selectProfile('eleveur')">
                <span class="profile-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M13 34c-5-6-4-15 2-19l3 3c2-5 7-8 12-6l-1 5c5-1 9 2 10 7l-5 1c3 4 2 9-2 12H17l-4-3Z" />
                    <path d="m30 18 5-5m-19 25v4m13-4v4m-15-6 4-1m16 1-4-1" />
                    <path d="m38 22 5 2-5 2" />
                  </svg>
                </span>
                <span class="profile-label">Éleveur — Aviculteur</span>
                <span class="profile-hint">J’achète des larves</span>
                <span class="profile-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          <div class="home-actions">
            <a routerLink="/connexion" class="login-button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
              </svg>
              <span>Se connecter</span>
            </a>
            <a routerLink="/inscription/producteur" class="register-link">
              <span class="plus-icon" aria-hidden="true">+</span>
              <span>Créer un profil producteur</span>
            </a>
          </div>
        </div>

        <footer class="trust-strip" aria-label="Nos engagements">
          <div class="trust-item">
            <span class="trust-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 21V11m0 2C5 13 4 8 4 4c5 0 8 2 8 9Zm0-3c0-5 3-8 8-8 0 5-3 8-8 8Z" /></svg>
            </span>
            <span>Production<br>locale</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m7 7 3-3 3 3M10 4v5M17 17l-3 3-3-3m3 3v-5M6 15a7 7 0 0 1-1-7m14 1a7 7 0 0 1 0 7" /></svg>
            </span>
            <span>Économie<br>circulaire</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m12 3 8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>
            </span>
            <span>Traçabilité<br>garantie</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-5a4.5 4.5 0 0 1 5 4v1h-4" /></svg>
            </span>
            <span>Agriculture<br>durable</span>
          </div>
        </footer>
      </section>

      <aside class="home-visual">
        <img class="hero-photo" src="/larvae-hero.png" alt="Larves dans un panier en osier entouré de feuilles">
        <p class="visual-tagline">Des larves<br>pour une agriculture<br>plus durable</p>
        <a routerLink="/admin" class="admin-link" aria-label="Accès administrateur">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 14 4.5l3.2-.2.8 3 2.7 1.8-1.2 3 1.2 3-2.7 1.8-.8 3-3.2-.2L12 22l-2-2.3-3.2.2-.8-3-2.7-1.8 1.2-3-1.2-3L6 7.3l.8-3 3.2.2L12 2Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Accès administrateur</span>
        </a>
      </aside>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100svh; color: #3f4a57; }
    .home-shell { display: flex; min-height: 100svh; background: #f7f6ef; overflow: hidden; }
    .home-main { width: 68%; min-height: 100svh; display: flex; flex-direction: column; justify-content: space-between; padding: 24px 5.5% 4vh; }
    .brand { display: flex; align-items: center; gap: 24px; min-height: 145px; }
    .brand-mark { width: clamp(88px, 9.3vw, 144px); height: clamp(88px, 9.3vw, 144px); flex: 0 0 auto; object-fit: contain; }
    .brand-name { margin: 0; color: #64102f; font: 700 clamp(32px, 4vw, 58px)/1 Georgia, serif; letter-spacing: -.035em; }
    .brand-description { margin: 4px 0 0; font-size: clamp(12px, 1.35vw, 20px); }
    .brand-tagline { display: inline-block; margin: 8px 0 0; border-top: 2px solid #4e7d3f; padding-top: 8px; color: #4e7d3f; font: italic clamp(16px, 1.8vw, 26px)/1.2 'Caveat', cursive; }
    .home-content { width: 100%; max-width: 960px; margin: 0 auto; }
    .welcome { margin-bottom: 28px; }
    .leaf-rule { height: 30px; display: flex; align-items: center; color: #4e7d3f; font-size: 28px; }
    .leaf-rule::after { content: ''; width: 145px; height: 1px; margin-left: 14px; background: #9aaa8f; }
    .welcome h2 { margin: 0; color: #64102f; font: 700 clamp(32px, 4.5vw, 58px)/1.03 Georgia, serif; letter-spacing: -.025em; }
    .welcome h2 strong { color: #4e7d3f; }
    .welcome p { margin: 12px 0 0; font-size: clamp(14px, 1.35vw, 20px); line-height: 1.35; }
    .profile-section h3 { margin: 0 0 10px; color: #64102f; font: 700 clamp(21px, 2.2vw, 30px)/1.2 Georgia, serif; }
    .profile-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .profile-card { position: relative; min-height: 182px; display: flex; flex-direction: column; align-items: flex-start; padding: 9px 16px 14px; border: 1px solid #d9d9cf; border-radius: 9px; background: rgba(255,255,255,.72); color: inherit; text-align: left; box-shadow: 0 2px 4px #3f08200d; cursor: pointer; transition: border-color .15s, transform .15s, box-shadow .15s; }
    .profile-card:hover, .profile-card:focus-visible { border-color: #4e7d3f; box-shadow: 0 4px 12px #3f08201a; transform: translateY(-2px); outline: none; }
    .profile-icon { width: 84px; height: 84px; display: grid; place-items: center; margin-bottom: 6px; border-radius: 50%; background: #e8f0df; }
    .profile-icon svg { width: 48px; height: 48px; stroke: #4e7d3f; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .profile-label { max-width: calc(100% - 18px); color: #64102f; font: 700 clamp(15px, 1.5vw, 21px)/1.2 Georgia, serif; }
    .profile-hint { margin-top: 8px; font-size: clamp(12px, 1.1vw, 16px); }
    .profile-arrow { position: absolute; right: 12px; bottom: 14px; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: #e8f0df; color: #4e7d3f; font-size: 28px; line-height: 1; }
    .home-actions { margin-top: 20px; text-align: center; }
    .login-button { min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 22px; border-radius: 8px; background: #64102f; color: white; text-decoration: none; font-size: clamp(16px, 1.6vw, 22px); transition: background .15s; }
    .login-button:hover, .login-button:focus-visible { background: #3f0820; }
    .login-button svg { width: 27px; height: 27px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .register-link { display: inline-flex; align-items: center; gap: 12px; margin-top: 12px; color: #4e7d3f; text-decoration: underline; font-size: 15px; }
    .plus-icon { width: 27px; height: 27px; border-radius: 50%; background: #4e7d3f; color: white; font-size: 22px; line-height: 25px; text-decoration: none; }
    .trust-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 22px; border-top: 1px solid #cfd2c7; padding: 16px 12px 0; }
    .trust-item { display: flex; align-items: center; justify-content: center; gap: 12px; color: #59636a; font-size: clamp(11px, 1.05vw, 15px); line-height: 1.35; }
    .trust-icon { width: 50px; height: 50px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: #e8f0df; color: #4e7d3f; font-size: 25px; font-weight: 700; }
    .trust-icon svg { width: 27px; height: 27px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .home-visual { position: relative; width: 32%; min-height: 100svh; }
    .hero-photo { display: block; width: 100%; height: 74svh; object-fit: cover; object-position: center; }
    .visual-tagline { margin: -3px 24px 0; color: #4e7d3f; text-align: center; font: italic 34px/1.05 'Caveat', cursive; transform: rotate(-5deg); }
    .admin-link { position: absolute; right: 28px; bottom: 6vh; display: flex; align-items: center; gap: 10px; color: #a4a79d; text-decoration: none; text-transform: uppercase; font-size: 11px; letter-spacing: .03em; }
    .admin-link:hover, .admin-link:focus-visible { color: #64102f; }
    .admin-link svg { width: 20px; height: 20px; fill: currentColor; }
    .admin-link svg circle { fill: #f7f6ef; }
    @media (min-width: 1500px) and (min-height: 900px) {
      .profile-card { min-height: 184px; }
      .home-actions { margin-top: 22px; }
    }
    @media (max-width: 1050px) {
      .home-main { width: 70%; padding-left: 4%; padding-right: 4%; }
      .home-visual { width: 30%; }
      .brand { gap: 14px; }
      .profile-card { min-height: 166px; padding: 9px 11px 12px; }
      .profile-icon { width: 66px; height: 66px; }
      .profile-icon svg { width: 40px; height: 40px; }
      .trust-icon { width: 40px; height: 40px; }
    }
    @media (max-width: 760px) {
      .home-shell { display: block; overflow: visible; }
      .home-main { width: 100%; min-height: 100svh; padding: 20px 22px 24px; gap: 26px; }
      .brand { min-height: 0; gap: 12px; }
      .brand-mark { width: 72px; height: 72px; }
      .brand-name { font-size: 32px; }
      .brand-description { font-size: 11px; }
      .brand-tagline { font-size: 17px; }
      .welcome { margin-bottom: 22px; }
      .welcome h2 { font-size: 38px; }
      .desktop-break { display: none; }
      .profile-cards { grid-template-columns: 1fr; gap: 9px; }
      .profile-card { min-height: 88px; display: grid; grid-template-columns: 64px 1fr 34px; grid-template-rows: 1fr 1fr; align-items: center; padding: 8px 12px; column-gap: 12px; }
      .profile-icon { grid-row: 1 / 3; width: 60px; height: 60px; margin: 0; }
      .profile-icon svg { width: 38px; height: 38px; }
      .profile-label { align-self: end; max-width: none; font-size: 17px; }
      .profile-hint { align-self: start; margin-top: 2px; font-size: 13px; }
      .profile-arrow { position: static; grid-column: 3; grid-row: 1 / 3; width: 34px; height: 34px; }
      .home-actions { margin-top: 16px; }
      .trust-strip { gap: 10px 4px; padding: 14px 0 0; }
      .trust-item { flex-direction: column; gap: 6px; text-align: center; font-size: 11px; }
      .trust-icon { width: 38px; height: 38px; font-size: 20px; }
      .home-visual { display: none; }
    }
    @media (max-width: 380px) {
      .brand-name { font-size: 28px; }
      .brand-description { font-size: 10px; }
      .welcome h2 { font-size: 33px; }
      .trust-item { font-size: 10px; }
    }
  `
})
export class AccueilComponent {
  constructor(private router: Router) {}

  selectProfile(profile: Profile): void {
    this.router.navigate([profile === 'producteur' ? '/inscription/producteur' : '/inscription/eleveur']);
  }
}
