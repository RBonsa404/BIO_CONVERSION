import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MarketplaceService, Produit } from '../../core/services/marketplace.service';
import { messageErreur } from '../../core/utils/http-error';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <main class="min-h-screen bg-cream px-5 py-8 md:px-8">
      <div class="mx-auto max-w-6xl">
        <a [routerLink]="produit() ? ['/producteur', produit()!.producteurId] : ['/marketplace']"
           class="mb-5 inline-block font-semibold text-green hover:text-wine">← Retour au catalogue</a>
        <h1 class="mb-6 font-serif text-3xl font-bold text-wine md:text-4xl">Récapitulatif de la commande</h1>

        @if (isLoadingProduct()) {
          <div role="status" class="rounded-xl bg-white p-6 text-text">Chargement du produit...</div>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ errorMessage() }}</div>
        }

        @if (produit(); as currentProduit) {
          <form [formGroup]="commandeForm" (ngSubmit)="onSubmit()"
                class="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_.8fr]">
            <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
              <div class="mb-5 flex items-center gap-4">
                <img src="/larvae-hero.webp" alt="" class="h-24 w-28 rounded-lg object-cover">
                <div>
                  <p class="text-sm text-text">{{ currentProduit.nomExploitation }}</p>
                  <h2 class="font-serif text-2xl font-semibold text-wine">{{ currentProduit.nomProduit }}</h2>
                  <p class="mt-1 text-sm text-green">{{ currentProduit.prix | number:'1.0-0' }} FCFA / kg</p>
                </div>
              </div>
              <div class="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                <div>
                  <label for="quantite" class="mb-2 block text-sm font-semibold text-text">Quantité (kg)</label>
                  <input id="quantite" type="number" min="0.5" step="0.5" [max]="currentProduit.quantiteStock"
                         formControlName="quantite"
                         class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                  @if (quantite.invalid && quantite.touched) {
                    <p class="mt-2 text-sm text-red-600" role="alert">
                      Entrez une quantité comprise entre 0,5 kg et le stock disponible ({{ currentProduit.quantiteStock }} kg).
                    </p>
                  }
                </div>
                <div class="rounded-xl bg-green-soft/60 p-4">
                  <span class="block text-sm text-text">Stock disponible</span>
                  <strong class="mt-1 block text-xl text-green">{{ currentProduit.quantiteStock }} kg</strong>
                </div>
              </div>
            </section>

            <aside class="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
              <h2 class="mb-4 font-serif text-2xl font-semibold text-wine">Confirmer</h2>
              <ol class="mb-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-text">
                <li>Vous envoyez la commande : le stock vous est réservé.</li>
                <li>Le producteur la valide sous 12 heures.</li>
                <li>Vous réglez par Orange Money, puis recevez votre facture.</li>
              </ol>
              <div class="flex items-center justify-between border-t border-line pt-5 text-text">
                <span>Total de la commande</span>
                <strong class="font-serif text-2xl text-wine">{{ totalEstime() | number:'1.0-0' }} FCFA</strong>
              </div>
              <button type="submit" [disabled]="commandeForm.invalid || isLoading()"
                      class="mt-6 w-full rounded-xl bg-wine px-5 py-4 font-semibold text-white hover:bg-wine-dark disabled:opacity-50">
                {{ isLoading() ? 'Envoi en cours...' : 'Envoyer la commande' }}
              </button>
              <p class="mt-4 text-sm text-text">Aucun paiement n’est demandé à cette étape.</p>
            </aside>
          </form>
        }
      </div>
    </main>
  `
})
export class CommandeComponent implements OnInit {
  readonly commandeForm: FormGroup<{ quantite: FormControl<number> }>;
  readonly produit = signal<Produit | null>(null);
  readonly isLoadingProduct = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private readonly quantiteSaisie: Signal<number>;
  readonly totalEstime = computed(() => (this.produit()?.prix ?? 0) * (Number(this.quantiteSaisie()) || 0));

  private produitId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private marketplaceService: MarketplaceService
  ) {
    this.commandeForm = this.fb.nonNullable.group({
      quantite: [1, [Validators.required, Validators.min(0.5)]]
    });
    this.quantiteSaisie = toSignal(this.quantite.valueChanges, { initialValue: this.quantite.value });
  }

  get quantite(): FormControl<number> {
    return this.commandeForm.controls.quantite;
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.queryParamMap.get('produitId');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage.set('Aucun produit valide n’a été sélectionné. Choisissez un produit depuis la marketplace.');
      return;
    }
    this.produitId = id;
    this.loadProduit();
  }

  loadProduit(): void {
    if (this.produitId === null) {
      return;
    }
    this.isLoadingProduct.set(true);
    this.errorMessage.set('');
    this.marketplaceService.obtenirProduit(this.produitId).subscribe({
      next: response => {
        this.produit.set(response.data);
        // La quantité ne peut pas dépasser le stock réellement disponible
        this.quantite.setValidators([
          Validators.required,
          Validators.min(0.5),
          Validators.max(response.data.quantiteStock)
        ]);
        this.quantite.updateValueAndValidity();
        this.isLoadingProduct.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Ce produit n’est plus disponible.'));
        this.isLoadingProduct.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.commandeForm.invalid || this.produitId === null) {
      this.commandeForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.passerCommande(this.produitId, this.quantite.value).subscribe({
      next: response => {
        this.router.navigate(['/confirmation'], { queryParams: { commandeId: response.data.idCommande } });
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'La commande n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
        // Le stock a pu changer entre-temps
        this.loadProduit();
      }
    });
  }
}
