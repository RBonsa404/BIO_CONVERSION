import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketplaceService, Produit, ProduitRequest, TypeProduit } from '../../core/services/marketplace.service';
import { messageErreur } from '../../core/utils/http-error';
import { libelleTypeProduit } from '../../core/utils/statuts';
import { PageHeaderComponent, UiBadgeComponent } from '../../shared/components';

@Component({
  selector: 'app-producteur-produits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, UiBadgeComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-5xl">
        <app-page-header surtitre="Espace producteur" titre="Mes produits"
                         sousTitre="Publiez vos larves et résidus, ajustez prix et stock">
          @if (!formOuvert()) {
            <button type="button" (click)="ouvrirCreation()"
                    class="rounded-xl bg-wine px-5 py-3 font-semibold text-white hover:bg-wine-dark">
              + Nouveau produit
            </button>
          }
        </app-page-header>

        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ errorMessage() }}</div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (formOuvert()) {
          <form [formGroup]="form" (ngSubmit)="enregistrer()"
                class="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-5 font-serif text-2xl font-semibold text-wine">
              {{ enEdition() ? 'Modifier le produit' : 'Nouveau produit' }}
            </h2>
            <div class="grid gap-5 md:grid-cols-2">
              <div class="md:col-span-2">
                <label for="nomProduit" class="mb-2 block text-sm font-semibold text-text">Nom du produit *</label>
                <input id="nomProduit" type="text" formControlName="nomProduit" maxlength="200"
                       placeholder="Ex : Larves fraîches"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="typeProduit" class="mb-2 block text-sm font-semibold text-text">Type *</label>
                <select id="typeProduit" formControlName="typeProduit"
                        class="w-full rounded-xl border-2 border-line bg-white px-4 py-3 focus:border-wine focus:outline-none">
                  <option value="LARVE">Larves</option>
                  <option value="RESIDU_PRODUCTION">Résidu de production (frass)</option>
                </select>
              </div>
              <div>
                <label for="prix" class="mb-2 block text-sm font-semibold text-text">Prix (FCFA / kg) *</label>
                <input id="prix" type="number" min="1" step="1" formControlName="prix"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="quantiteStock" class="mb-2 block text-sm font-semibold text-text">Stock disponible (kg) *</label>
                <input id="quantiteStock" type="number" min="0" step="0.5" formControlName="quantiteStock"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
            </div>
            @if (form.invalid && form.touched) {
              <p class="mt-4 text-sm text-red-600" role="alert">
                Renseignez un nom, un prix supérieur à zéro et un stock positif ou nul.
              </p>
            }
            <div class="mt-6 flex flex-wrap gap-3">
              <button type="submit" [disabled]="isSaving()"
                      class="rounded-xl bg-wine px-6 py-3 font-semibold text-white hover:bg-wine-dark disabled:opacity-50">
                {{ isSaving() ? 'Enregistrement...' : (enEdition() ? 'Enregistrer' : 'Publier le produit') }}
              </button>
              <button type="button" (click)="fermer()"
                      class="rounded-xl border border-line bg-white px-6 py-3 font-semibold text-text hover:border-wine">
                Annuler
              </button>
            </div>
          </form>
        }

        @if (isLoading()) {
          <p role="status" class="py-8 text-center text-text">Chargement du catalogue...</p>
        }
        @if (!isLoading() && produits().length === 0 && !errorMessage()) {
          <p class="rounded-xl border border-line bg-white p-8 text-center text-text">
            Vous n’avez encore publié aucun produit. Ajoutez-en un pour apparaître sur la marketplace.
          </p>
        }

        <div class="grid gap-4 md:grid-cols-2">
          @for (produit of produits(); track produit.idProduit) {
            <article class="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm"
                     [class.opacity-70]="!produit.disponibilite">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-green">{{ libelleType(produit.typeProduit) }}</p>
                  <h2 class="mt-1 font-serif text-xl font-semibold text-wine">{{ produit.nomProduit }}</h2>
                </div>
                <app-ui-badge [variant]="produit.disponibilite ? (produit.quantiteStock > 0 ? 'success' : 'warning') : 'gray'">
                  {{ produit.disponibilite ? (produit.quantiteStock > 0 ? 'En vente' : 'Rupture de stock') : 'Retiré' }}
                </app-ui-badge>
              </div>
              <p class="mt-3 font-serif text-2xl font-bold text-wine">
                {{ produit.prix | number:'1.0-0' }} <small class="text-base">FCFA/kg</small>
              </p>
              <p class="mt-1 text-sm text-text">Stock : {{ produit.quantiteStock }} kg</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <button type="button" (click)="ouvrirEdition(produit)"
                        class="rounded-lg border border-wine bg-white px-4 py-2 text-sm font-semibold text-wine hover:bg-cream">
                  Modifier
                </button>
                @if (produit.disponibilite) {
                  <button type="button" (click)="basculer(produit)" [disabled]="processingId() === produit.idProduit"
                          class="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-text hover:border-wine disabled:opacity-50">
                    Retirer de la vente
                  </button>
                } @else {
                  <button type="button" (click)="basculer(produit)" [disabled]="processingId() === produit.idProduit"
                          class="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    Remettre en vente
                  </button>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </main>
  `
})
export class ProducteurProduitsComponent implements OnInit {
  readonly form: FormGroup<{
    nomProduit: FormControl<string>;
    typeProduit: FormControl<TypeProduit>;
    prix: FormControl<number | null>;
    quantiteStock: FormControl<number | null>;
  }>;

  readonly produits = signal<Produit[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formOuvert = signal(false);
  readonly enEdition = signal<Produit | null>(null);
  readonly processingId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');

  readonly libelleType = libelleTypeProduit;

  constructor(private fb: FormBuilder, private marketplaceService: MarketplaceService) {
    this.form = this.fb.group({
      nomProduit: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
      typeProduit: this.fb.nonNullable.control<TypeProduit>('LARVE', [Validators.required]),
      prix: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      quantiteStock: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)])
    });
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.listerMesProduits().subscribe({
      next: response => {
        this.produits.set(response.data);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger votre catalogue. Réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  ouvrirCreation(): void {
    this.enEdition.set(null);
    this.form.reset({ nomProduit: '', typeProduit: 'LARVE', prix: null, quantiteStock: null });
    this.formOuvert.set(true);
    this.actionMessage.set('');
  }

  ouvrirEdition(produit: Produit): void {
    this.enEdition.set(produit);
    this.form.reset({
      nomProduit: produit.nomProduit,
      typeProduit: produit.typeProduit,
      prix: produit.prix,
      quantiteStock: produit.quantiteStock
    });
    this.formOuvert.set(true);
    this.actionMessage.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fermer(): void {
    this.formOuvert.set(false);
    this.enEdition.set(null);
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur = this.form.getRawValue();
    const requete: ProduitRequest = {
      nomProduit: valeur.nomProduit.trim(),
      typeProduit: valeur.typeProduit,
      prix: Number(valeur.prix),
      quantiteStock: Number(valeur.quantiteStock)
    };
    const existant = this.enEdition();

    this.isSaving.set(true);
    this.errorMessage.set('');
    const appel = existant
      ? this.marketplaceService.modifierProduit(existant.idProduit, requete)
      : this.marketplaceService.publierProduit(requete);
    appel.subscribe({
      next: response => {
        this.produits.update(list => existant
          ? list.map(p => p.idProduit === existant.idProduit ? response.data : p)
          : [response.data, ...list]);
        this.actionMessage.set(existant
          ? `« ${response.data.nomProduit} » a été mis à jour.`
          : `« ${response.data.nomProduit} » est maintenant visible sur la marketplace.`);
        this.isSaving.set(false);
        this.fermer();
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Le produit n’a pas pu être enregistré. Réessayez.'));
        this.isSaving.set(false);
      }
    });
  }

  /** Retire le produit de la vente, ou le remet en vente. */
  basculer(produit: Produit): void {
    this.processingId.set(produit.idProduit);
    this.errorMessage.set('');
    this.actionMessage.set('');
    const fin = (disponibilite: boolean) => {
      this.produits.update(list => list.map(p =>
        p.idProduit === produit.idProduit ? { ...p, disponibilite } : p));
      this.actionMessage.set(disponibilite
        ? `« ${produit.nomProduit} » est de nouveau en vente.`
        : `« ${produit.nomProduit} » n’est plus proposé sur la marketplace.`);
      this.processingId.set(null);
    };
    const echec = (error: unknown) => {
      this.errorMessage.set(messageErreur(error, 'La modification a échoué. Réessayez.'));
      this.processingId.set(null);
    };

    if (produit.disponibilite) {
      this.marketplaceService.retirerProduit(produit.idProduit).subscribe({ next: () => fin(false), error: echec });
    } else {
      this.marketplaceService.republierProduit(produit.idProduit).subscribe({ next: () => fin(true), error: echec });
    }
  }
}
