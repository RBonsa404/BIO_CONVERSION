import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type Profile = 'producteur' | 'eleveur';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <header class="topbar">
        <div class="wrap topbar-in">
          <a routerLink="/" class="brand" aria-label="BioConversion, accueil">
            <span class="brand-mark"><img src="/logo.png" alt=""></span>
            <span class="brand-text">
              <span class="brand-name">BioConversion</span>
              <span class="brand-sub">
                <span>Production locale de larves de mouches soldats noires</span>
              </span>
            </span>
          </a>
          <a routerLink="/connexion" class="btn-login">Se connecter</a>
        </div>
      </header>

      <main class="wrap stage">
        <!-- Colonne texte -->
        <section class="left">
          <h1 class="title" aria-label="Bienvenue sur BioConversion">
            <span class="l1" aria-hidden="true">{{ line1() }}</span>
            <span class="l2" aria-hidden="true">{{ line2() }}</span>
          </h1>
          <p class="tagline">
            Votre plateforme de mise en relation des producteurs de larves de mouches soldats noires
            et des éleveurs piscicoles et avicoles
          </p>
          <p class="lead lead-main">
            Producteur ou éleveur&nbsp;? Trouvez votre partenaire en un clic.
          </p>
          <p class="lead">
            Valorisez vos bio-déchets et nourrissez vos animaux avec une protéine locale, de confiance.
          </p>

          <h2 class="ask" id="profil-titre">Choisissez votre profil</h2>
          <div class="cards" role="group" aria-labelledby="profil-titre">
            <button type="button" class="card" (click)="selectProfile('producteur')">
              <span class="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48"><path d="M24 24v16m0-16c-9 0-13-5-13-13 8 0 13 4 13 13Zm0-4c0-8 4-13 13-13 0 8-4 13-13 13Z"/><path d="M8 35c5-6 11-7 16-4 5-3 11-2 16 4l-4 4H12l-4-4Z"/></svg>
              </span>
              <span class="card-title">Producteur</span>
              <span class="card-hint">Je produis et je vends mes larves</span>
              <span class="card-go">Créer mon profil</span>
            </button>
            <button type="button" class="card" (click)="selectProfile('eleveur')">
              <span class="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48"><path d="M6 22c4-2 8-5 11-8l19 2 7 6-7 7-18 1-12-8Z"/><circle cx="36" cy="20" r="1.5"/><path d="M10 35c5-3 10-3 15 0s10 3 15 0m-30 5c5-3 10-3 15 0s10 3 15 0"/></svg>
              </span>
              <span class="card-title">Pisciculteur</span>
              <span class="card-hint">J’achète des larves pour mes poissons</span>
              <span class="card-go">Créer mon profil</span>
            </button>
            <button type="button" class="card" (click)="selectProfile('eleveur')">
              <span class="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48"><path d="M13 34c-5-6-4-15 2-19l3 3c2-5 7-8 12-6l-1 5c5-1 9 2 10 7l-5 1c3 4 2 9-2 12H17l-4-3Z"/><path d="m30 18 5-5m-19 25v4m13-4v4"/></svg>
              </span>
              <span class="card-title">Aviculteur</span>
              <span class="card-hint">J’achète des larves pour ma volaille</span>
              <span class="card-go">Créer mon profil</span>
            </button>
          </div>
          <p class="already">Déjà inscrit ? <a routerLink="/connexion">Connectez-vous</a></p>

          <ul class="values" aria-label="Nos engagements">
            <li><span class="v-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21V11m0 2C5 13 4 8 4 4c5 0 8 2 8 9Zm0-3c0-5 3-8 8-8 0 5-3 8-8 8Z"/></svg></span>Production locale</li>
            <li><span class="v-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m7 7 3-3 3 3M10 4v5M17 17l-3 3-3-3m3 3v-5M6 15a7 7 0 0 1-1-7m14 1a7 7 0 0 1 0 7"/></svg></span>Économie circulaire</li>
            <li><span class="v-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg></span>Traçabilité garantie</li>
            <li><span class="v-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-5a4.5 4.5 0 0 1 5 4v1h-4"/></svg></span>Élevage durable</li>
          </ul>
        </section>

        <!-- Colonne photo -->
        <section class="right" aria-label="En images">
          <div class="photo">
            @for (p of photos; track p.src; let i = $index) {
              <img [src]="p.src" [alt]="p.alt" class="slide" [class.active]="i === current()">
            }
            <div class="shade"></div>
            <p class="photo-text">Producteurs et éleveurs, enfin connectés</p>
            @if (photos.length > 1) {
              <div class="dots">
                @for (p of photos; track p.src; let i = $index) {
                  <button type="button" class="dot" [class.active]="i === current()"
                          (click)="goTo(i)" [attr.aria-label]="'Voir la photo ' + (i + 1)"></button>
                }
              </div>
            }
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="wrap footer-in">
          <span class="f-copy">© 2026 BioConversion</span>
          <nav class="f-links" aria-label="Liens utiles">
            <a routerLink="/inscription/producteur">Devenir producteur</a>
            <a routerLink="/inscription/eleveur">Devenir éleveur</a>
            <!-- TODO : remplacer par vos vraies coordonnées -->
            <a href="mailto:contact@bioconversion.bf">contact@bioconversion.bf</a>
            <span>Ouagadougou</span>
          </nav>
          <div class="f-right">
            <a href="https://wa.me/22600000000" class="wa">WhatsApp</a>
            <a routerLink="/admin" class="admin">Accès administrateur</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: `
    :host {
      --bordeaux: #64102f; --bordeaux-dark: #3f0820; --vert: #4e7d3f; --vert-dark: #2f4d27;
      --creme: #f7f6ef; --vert-clair: #e8f0df; --texte: #3f4a57;
      --serif: 'Fraunces', 'Playfair Display', Georgia, serif;
      --sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
      display: block; background: var(--creme); color: var(--texte);
      font-family: var(--sans); font-size: 16px; line-height: 1.5;
    }
    a { color: inherit; }
    h1, h2, p, ul { margin: 0; padding: 0; }
    .wrap { width: 100%; max-width: 1320px; margin: 0 auto; padding-left: 40px; padding-right: 40px; box-sizing: border-box; }

    /* Structure : en-tête / contenu / footer = un seul écran */
    .page { min-height: 100svh; display: grid; grid-template-rows: auto 1fr auto; }

    /* En-tête */
    .topbar { border-bottom: 1px solid #e4e3d6; }
    .topbar-in { display: flex; align-items: center; justify-content: space-between; height: 88px; }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .brand-mark { flex: 0 0 auto; width: 72px; height: 72px; overflow: hidden; border-radius: 50%; background: #fff; }
    .brand-mark img { display: block; width: 100%; height: 100%; object-fit: contain; transform: scale(1.04); }
    .brand-text { display: flex; flex-direction: column; line-height: 1.15; }
    .brand-sub { display: flex; flex-direction: column; gap: 1px; margin-top: 3px; font-size: 12.5px; line-height: 1.3; color: #66707a; }
    .brand-sub span:first-child { color: #4d5861; font-weight: 500; }
    .brand-name { color: var(--bordeaux); font: 700 25px/1.1 var(--serif); letter-spacing: -.01em; }
    .btn-login { padding: 9px 24px; border-radius: 999px; background: var(--bordeaux); color: #fff; text-decoration: none; font-weight: 600; font-size: 15px; transition: background .15s; }
    .btn-login:hover, .btn-login:focus-visible { background: var(--bordeaux-dark); }

    /* Contenu : texte à gauche, photos à droite */
    .stage { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: clamp(28px, 4vw, 64px); padding-top: clamp(16px, 3vh, 36px); padding-bottom: clamp(16px, 3vh, 36px); align-items: stretch; }
    .left { display: flex; flex-direction: column; justify-content: flex-start; min-width: 0; }

    /* Titre : "Bienvenue sur BioConversion" sur UNE seule ligne */
    .title { min-height: 1.1em; font: 700 clamp(26px, 3vw, 40px)/1.1 var(--serif); letter-spacing: -.03em; }
    .l1, .l2 { display: inline; }
    .l1 { color: var(--bordeaux); }
    .l2 { margin-left: .28em; color: var(--vert); }

    /* Textes sous le titre : plus grands */
    .tagline { margin-top: clamp(10px, 1.8vh, 18px); max-width: 700px; color: var(--vert); font: italic 600 clamp(26px, 3.6vh, 36px)/1.2 'Caveat', cursive; text-wrap: balance; }
    .lead { margin-top: clamp(8px, 1.4vh, 14px); max-width: 62ch; font-size: clamp(16px, 2.3vh, 20px); line-height: 1.5; }
    .lead-main { font-weight: 600; color: #2f3a45; font-size: clamp(18px, 2.6vh, 22px); }
    .lead + .lead { margin-top: 6px; }

    .ask { margin-top: clamp(16px, 3.2vh, 32px); color: var(--bordeaux); font: 700 clamp(19px, 2.7vh, 24px)/1.2 var(--serif); }
    .cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
    .card { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; padding: 14px 14px 12px; border: 1px solid #dcdccf; border-radius: 14px; background: #fff; color: inherit; font: inherit; text-align: left; cursor: pointer; transition: border-color .15s, background .15s; }
    .card:hover, .card:focus-visible { border-color: var(--vert); background: #f6faf1; outline: none; }
    .card:focus-visible { box-shadow: 0 0 0 3px #4e7d3f55; }
    .card-icon { width: 46px; height: 46px; display: grid; place-items: center; margin-bottom: 4px; border-radius: 50%; background: var(--vert-clair); }
    .card-icon svg { width: 26px; height: 26px; fill: none; stroke: var(--vert); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .card-title { color: var(--bordeaux); font: 700 clamp(17px, 2.3vh, 20px)/1.2 var(--serif); }
    .card-hint { font-size: 14px; line-height: 1.35; }
    .card-go { margin-top: auto; padding-top: 8px; color: var(--vert); font-size: 14px; font-weight: 700; }
    .card:hover .card-go { text-decoration: underline; }
    .already { margin-top: 12px; margin-bottom: clamp(14px, 2.6vh, 26px); font-size: 14.5px; }
    .already a { color: var(--bordeaux); font-weight: 600; }

    .values { list-style: none; display: grid; grid-template-columns: repeat(4, auto); justify-content: space-between; gap: 12px; margin-top: auto; padding-top: clamp(10px, 1.8vh, 16px); border-top: 1px solid #dcdccf; }
    .values li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; line-height: 1.25; color: #4d5861; }
    .v-icon { width: 32px; height: 32px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: var(--vert-clair); }
    .v-icon svg { width: 18px; height: 18px; fill: none; stroke: var(--vert); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

    /* Photo */
    .right { position: relative; min-height: 320px; }
    .photo { position: absolute; inset: 0; overflow: hidden; border-radius: 24px; background: #dfe6d3; }
    .slide { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.2s ease; }
    .slide.active { opacity: 1; }
    .shade { position: absolute; inset: auto 0 0 0; height: 40%; background: linear-gradient(to top, #1c2a17cc, transparent); pointer-events: none; }
    .photo-text { position: absolute; left: 28px; right: 28px; bottom: 40px; color: #fff; font: italic 600 clamp(26px, 3.4vh, 36px)/1.1 'Caveat', cursive; text-shadow: 0 1px 8px #0006; }
    .dots { position: absolute; left: 28px; bottom: 18px; display: flex; gap: 8px; }
    .dot { width: 24px; height: 4px; padding: 0; border: 0; border-radius: 2px; background: #ffffff66; cursor: pointer; transition: background .2s; }
    .dot:hover { background: #ffffffb3; }
    .dot.active { background: #fff; }

    /* Footer mince */
    .footer { background: var(--vert-dark); color: #dfe8d6; font-size: 13.5px; }
    .footer-in { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 48px; }
    .f-links { display: flex; align-items: center; gap: 22px; }
    .f-links a, .admin { text-decoration: none; }
    .f-links a:hover, .admin:hover { text-decoration: underline; }
    .f-right { display: flex; align-items: center; gap: 18px; }
    .wa { padding: 4px 14px; border-radius: 999px; background: #25d366; color: #0b3d1c; font-weight: 700; text-decoration: none; }
    .admin { color: #aebfa3; font-size: 12.5px; }

    @media (prefers-reduced-motion: reduce) { .slide { transition: none; } }

    /* Écrans bas (portables) */
    @media (max-height: 800px) {
      .card-hint { font-size: 13px; }
    }

    /* Tablette et mobile : empilé, défilement normal */
    @media (max-width: 980px) {
      .wrap { padding-left: 20px; padding-right: 20px; }
      .stage { grid-template-columns: 1fr; gap: 24px; }
      .right { order: -1; min-height: 0; aspect-ratio: 16 / 9; }
      .title { font-size: clamp(20px, 5.4vw, 48px); }
      .tagline { font-size: clamp(24px, 5vw, 32px); }
      .lead { font-size: 17px; }
      .lead-main { font-size: 19px; }
      .values { grid-template-columns: repeat(2, auto); justify-content: start; gap: 12px 28px; }
      .footer-in { flex-wrap: wrap; padding-top: 12px; padding-bottom: 12px; }
      .f-links { flex-wrap: wrap; gap: 8px 18px; }
    }
    @media (max-width: 620px) {
      .brand-sub { display: none; }
      .cards { grid-template-columns: 1fr; }
      .card { display: grid; grid-template-columns: 46px 1fr; column-gap: 12px; align-items: center; }
      .card-icon { grid-row: 1 / 4; margin: 0; }
      .card-go { padding-top: 4px; }
    }
  `
})
export class AccueilComponent implements OnInit, OnDestroy {
  private readonly text1 = 'Bienvenue sur';
  private readonly text2 = 'BioConversion';
  line1 = signal('');
  line2 = signal('');

  /* Photos dans frontend/public/carousel/ (photo-1.png ... photo-8.png).
     Défilement toutes les 3,5 s, aller-retour : 1 → 8 puis 8 → 1. */
  photos = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
    src: `/carousel/photo-${n}.png`,
    alt: `BioConversion, élevage de mouches soldats noires (photo ${n})`,
  }));
  current = signal(0);
  private dir = 1;

  private typing?: ReturnType<typeof setInterval>;
  private slider?: ReturnType<typeof setInterval>;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.line1.set(this.text1);
      this.line2.set(this.text2);
    } else {
      let i = 0;
      const total = this.text1.length + this.text2.length;
      this.typing = setInterval(() => {
        i++;
        this.line1.set(this.text1.slice(0, Math.min(i, this.text1.length)));
        this.line2.set(this.text2.slice(0, Math.max(0, i - this.text1.length)));
        if (i >= total) clearInterval(this.typing);
      }, 75);
    }

    if (this.photos.length > 1) {
      this.startSlider();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.typing);
    clearInterval(this.slider);
  }

  goTo(i: number): void {
    this.current.set(i);
    this.dir = i >= this.photos.length - 1 ? -1 : 1;
    clearInterval(this.slider);
    this.startSlider();
  }

  private startSlider(): void {
    this.slider = setInterval(() => {
      let next = this.current() + this.dir;
      if (next >= this.photos.length || next < 0) {
        this.dir = -this.dir;
        next = this.current() + this.dir;
      }
      this.current.set(next);
    }, 3500);
  }

  selectProfile(profile: Profile): void {
    this.router.navigate([profile === 'producteur' ? '/inscription/producteur' : '/inscription/eleveur']);
  }
}