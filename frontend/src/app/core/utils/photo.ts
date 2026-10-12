/** Côté maximal (en pixels) d'une photo de produit après réduction. */
const COTE_MAX = 1000;

/** Qualité JPEG : 0.8 garde une image nette pour un fichier d'environ 100 à 200 Ko. */
const QUALITE_JPEG = 0.8;

/**
 * Réduit une photo avant l'envoi : une photo de téléphone pèse plusieurs Mo, ce qui est
 * long et coûteux sur une connexion mobile, alors qu'une vignette de catalogue n'en a pas besoin.
 *
 * Renvoie un fichier JPEG. Lève une erreur si le fichier n'est pas une image lisible
 * par le navigateur.
 */
export async function reduirePhoto(fichier: File): Promise<Blob> {
  const bitmap = await createImageBitmap(fichier);
  try {
    const echelle = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
    const largeur = Math.round(bitmap.width * echelle);
    const hauteur = Math.round(bitmap.height * echelle);

    const canvas = document.createElement('canvas');
    canvas.width = largeur;
    canvas.height = hauteur;
    const contexte = canvas.getContext('2d');
    if (!contexte) {
      throw new Error('Canvas indisponible');
    }
    // Fond blanc : un PNG transparent deviendrait noir une fois converti en JPEG.
    contexte.fillStyle = '#ffffff';
    contexte.fillRect(0, 0, largeur, hauteur);
    contexte.drawImage(bitmap, 0, 0, largeur, hauteur);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Conversion impossible'))),
        'image/jpeg',
        QUALITE_JPEG
      );
    });
  } finally {
    bitmap.close();
  }
}
