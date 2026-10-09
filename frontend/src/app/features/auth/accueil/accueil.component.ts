import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
            <span class="brand-mark"><img src="/logo.webp" alt=""></span>
            <span class="brand-text">
              <span class="brand-name">BioConversion</span>
              <span class="brand-sub">
                <span>Production locale de larves de mouches soldats noires</span>
              </span>
            </span>
          </a>
          @if (connecte()) {
            <a [routerLink]="espace()" class="btn-login">Mon espace</a>
          } @else {
            <a routerLink="/connexion" class="btn-login">Se connecter</a>
          }
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
              <span class="card-icon" aria-hidden="true"><i class="ico" style="--icone: url('/icons/producteur.svg')"></i></span>
              <span class="card-title">Producteur</span>
              <span class="card-hint">Je produis et je vends mes larves</span>
              <span class="card-go">Créer mon profil</span>
            </button>
            <button type="button" class="card" (click)="selectProfile('eleveur')">
              <span class="card-icon duo" aria-hidden="true">
                <i class="ico" style="--icone: url('/icons/pisciculteur.svg')"></i>
                <i class="ico" style="--icone: url('/icons/aviculteur.svg')"></i>
              </span>
              <span class="card-title">Éleveur</span>
              <span class="card-hint">J’achète des larves pour mes poissons ou ma volaille</span>
              <span class="card-go">Créer mon profil</span>
            </button>
          </div>
          @if (connecte()) {
            <p class="already">Vous êtes connecté. <a [routerLink]="espace()">Accéder à mon espace</a></p>
          } @else {
            <p class="already">Déjà inscrit ? <a routerLink="/connexion">Connectez-vous</a></p>
          }

          <!-- Carrousel des engagements -->
          <div class="values" role="region" aria-label="Nos engagements"
               (mouseenter)="pauseValues()" (mouseleave)="resumeValues()">
            <div class="v-viewport">
              <div class="v-track" [style.transform]="'translateX(-' + (valueIndex() * 100) + '%)'">
                @for (v of values; track v.label; let i = $index) {
                  <div class="v-slide" [attr.aria-hidden]="i !== valueIndex()">
                    <span class="v-icon" aria-hidden="true">
                      @if (v.icon) {
                        <i class="ico" [style.--icone]="'url(' + v.icon + ')'"></i>
                      } @else {
                        <svg viewBox="0 0 24 24"><path d="m12 3 8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>
                      }
                    </span>
                    <span class="v-label">{{ v.label }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="v-dots">
              @for (v of values; track v.label; let i = $index) {
                <button type="button" class="v-dot" [class.active]="i === valueIndex()"
                        (click)="goToValue(i)" [attr.aria-label]="'Voir : ' + v.label"></button>
              }
            </div>
          </div>
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
            <a [href]="'mailto:' + contact.email">{{ contact.email }}</a>
            <span>Ouagadougou</span>
          </nav>
          @if (contact.whatsapp) {
            <div class="f-right">
              <a [href]="'https://wa.me/' + contact.whatsapp" class="wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          }
        </div>
        <div class="f-credit">
          Icônes : <a href="https://www.flaticon.com/uicons" target="_blank" rel="noopener noreferrer">Flaticon UIcons</a>
          par <a href="https://www.flaticon.com" target="_blank" rel="noopener noreferrer">Flaticon</a>
          (<a href="https://www.freepik.com" target="_blank" rel="noopener noreferrer">Freepik Company</a>)
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
    .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
    .card { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 14px 14px 12px; border: 1px solid #dcdccf; border-radius: 14px; background: #fff; color: inherit; font: inherit; text-align: center; cursor: pointer; transition: border-color .15s, background .15s; }
    .card:hover, .card:focus-visible { border-color: var(--vert); background: #f6faf1; outline: none; }
    .card:focus-visible { box-shadow: 0 0 0 3px #4e7d3f55; }
    .card-icon { width: 46px; height: 46px; display: grid; place-items: center; margin-bottom: 4px; border-radius: 50%; background: var(--vert-clair); }
    .card-title { color: var(--bordeaux); font: 700 clamp(17px, 2.3vh, 20px)/1.2 var(--serif); }
    .card-hint { font-size: 14px; line-height: 1.35; }
    .card-go { margin-top: auto; padding-top: 8px; color: var(--vert); font-size: 14px; font-weight: 700; }
    .card:hover .card-go { text-decoration: underline; }
    .already { margin-top: 12px; margin-bottom: clamp(14px, 2.6vh, 26px); font-size: 14.5px; }
    .already a { color: var(--bordeaux); font-weight: 600; }

    /* Carrousel des engagements */
    .values { margin-top: auto; padding-top: clamp(10px, 1.8vh, 16px); border-top: 1px solid #dcdccf; }
    .v-viewport { overflow: hidden; }
    .v-track { display: flex; transition: transform .6s ease; }
    .v-slide { flex: 0 0 100%; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 4px 0; }
    .v-label { color: var(--bordeaux); font: 700 18px/1.2 var(--serif); }
    .v-icon { width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: var(--vert-clair); }
    .v-dots { display: flex; justify-content: center; gap: 8px; margin-top: 8px; }
    .v-dot { width: 22px; height: 4px; padding: 0; border: 0; border-radius: 2px; background: #cfd6c4; cursor: pointer; transition: background .2s; }
    .v-dot:hover { background: #a9b89b; }
    .v-dot.active { background: var(--vert); }

    /* Icônes Flaticon (SVG colorés en vert par masque CSS) */
    .ico { display: block; background-color: var(--vert); -webkit-mask: var(--icone) center / contain no-repeat; mask: var(--icone) center / contain no-repeat; }
    .card-icon .ico { width: 26px; height: 26px; }
    .card-icon.duo { width: auto; display: flex; gap: 6px; padding: 0 12px; border-radius: 23px; }
    .card-icon.duo .ico { width: 22px; height: 22px; }
    .v-icon .ico { width: 22px; height: 22px; }
    .v-icon svg { width: 22px; height: 22px; fill: none; stroke: var(--vert); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

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
    .f-links a { text-decoration: none; }
    .f-links a:hover { text-decoration: underline; }
    .f-right { display: flex; align-items: center; gap: 18px; }
    .wa { padding: 4px 14px; border-radius: 999px; background: #25d366; color: #0b3d1c; font-weight: 700; text-decoration: none; }
    .f-credit { padding: 0 20px 10px; text-align: center; font-size: 12px; color: #aebfa3; }
    .f-credit a { color: #dfe8d6; text-decoration: underline; }
    .f-credit a:hover { color: #fff; }

    @media (prefers-reduced-motion: reduce) { .slide, .v-track { transition: none; } }

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
      .footer-in { flex-wrap: wrap; padding-top: 12px; padding-bottom: 12px; }
      .f-links { flex-wrap: wrap; gap: 8px 18px; }
    }
    @media (max-width: 620px) {
      .brand-sub { display: none; }
      .cards { grid-template-columns: 1fr; }
    }
  `
})
export class AccueilComponent implements OnInit, OnDestroy {
  private readonly text1 = 'Bienvenue sur';
  private readonly text2 = 'BioConversion';
  line1 = signal('');
  line2 = signal('');

  /* Coordonnées du footer : le bouton WhatsApp n'apparaît que si un numéro est
     renseigné (format international sans « + », ex. 22670123456). */
  readonly contact = { email: 'contact@bioconversion.bf', whatsapp: '' };

  /* Un visiteur déjà connecté retrouve son espace au lieu du bouton de connexion */
  readonly connecte = computed(() => this.authService.isAuthenticated());
  readonly espace = computed(() => this.authService.homeRoute());

  /* Photos dans frontend/public/carousel/ (photo-1.webp ... photo-8.webp).
     Défilement toutes les 3,5 s, aller-retour : 1 → 8 puis 8 → 1. */
  photos = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
    src: `/carousel/photo-${n}.webp`,
    alt: `BioConversion, élevage de mouches soldats noires (photo ${n})`,
  }));
  current = signal(0);
  private dir = 1;

  /* Engagements en carrousel (icônes dans frontend/public/icons/).
     Sans "icon" : l'icône SVG intégrée du template est utilisée. */
  values: { label: string; icon?: string }[] = [
    { label: 'Production locale', icon: '/icons/production-locale.svg' },
    { label: 'Économie circulaire', icon: '/icons/economie-circulaire.svg' },
    { label: 'Traçabilité garantie' },
    { label: 'Élevage durable', icon: '/icons/agriculture-durable.svg' },
  ];
  valueIndex = signal(0);
  private reduceMotion = false;

  private typing?: ReturnType<typeof setInterval>;
  private slider?: ReturnType<typeof setInterval>;
  private valueTimer?: ReturnType<typeof setInterval>;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.reduceMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (this.reduceMotion) {
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
    this.startValues();
  }

  ngOnDestroy(): void {
    clearInterval(this.typing);
    clearInterval(this.slider);
    clearInterval(this.valueTimer);
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

  /* Carrousel des engagements : défilement toutes les 3 s, en boucle */
  goToValue(i: number): void {
    this.valueIndex.set(i);
    this.startValues();
  }

  pauseValues(): void {
    clearInterval(this.valueTimer);
  }

  resumeValues(): void {
    this.startValues();
  }

  private startValues(): void {
    clearInterval(this.valueTimer);
    if (this.reduceMotion || this.values.length < 2) return;
    this.valueTimer = setInterval(() => {
      this.valueIndex.set((this.valueIndex() + 1) % this.values.length);
    }, 3000);
  }

  /* Le type d'élevage (pisciculture ou aviculture) se choisit une seule fois, dans le formulaire éleveur */
  selectProfile(profile: Profile): void {
    this.router.navigate([profile === 'producteur' ? '/inscription/producteur' : '/inscription/eleveur']);
  }
}