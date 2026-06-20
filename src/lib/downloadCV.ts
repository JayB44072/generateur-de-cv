/**
 * downloadCV.ts
 * Génère un PDF A4 depuis le DOM.
 *
 * IMPORTANT — Pourquoi html-to-image et pas html2canvas :
 * html2canvas (v1.x) simule lui-même chaque règle CSS (box-shadow,
 * border-radius complexe, gradients) en dessinant manuellement sur un
 * <canvas> avec son propre moteur de calcul de courbes. Ce moteur plante
 * de façon récurrente avec l'erreur :
 *   "Failed to execute 'addColorStop' on 'CanvasGradient': The provided
 *    double value is non-finite"
 * dès qu'une combinaison de styles (ombre + radius complexe, dégradés,
 * formes organiques, etc.) produit un rayon ou un ratio non fini dans son
 * calcul interne. Ce bug est documenté et récurrent dans html2canvas et
 * n'est pas résolu de façon fiable en corrigeant les styles un par un.
 *
 * html-to-image utilise une approche radicalement différente : il sérialise
 * le DOM réel dans un <svg><foreignObject> et laisse le moteur de rendu
 * NATIF du navigateur dessiner le tout (comme un vrai onglet web), avant de
 * convertir le SVG résultant en image. Cela élimine complètement cette
 * classe de bugs puisqu'aucune règle CSS n'est réimplémentée manuellement.
 */

async function waitForImages(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    imgs.map(img => {
      // Pour forcer le navigateur à accepter l'origine croisée (Supabase/Google)
      if (!img.hasAttribute('crossorigin')) {
        img.setAttribute('crossorigin', 'anonymous');
      }
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
        setTimeout(() => resolve(), 5000);
      });
    })
  );
}

/**....................................................................... */

// Fonction pour convertir une image URL en DataURL Base64 locale (règle le problème CORS sur Mobile)
async function convertImgToBase64(img: HTMLImageElement): Promise<void> {
  if (!img.src || img.src.startsWith('data:')) return;

  try {
    // 🚀 Configuration de l'origine croisée AVANT le fetch pour éviter le blocage CORS Mobile
    img.crossOrigin = 'anonymous'; 
    
    const res = await fetch(img.src, { mode: 'cors' });
    const blob = await res.blob();
    
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string; // Remplace l'URL externe par le Base64 local
        resolve();
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Impossible de convertir l'image en Base64 (CORS) :", img.src, err);
  }
}

async function prepareAndPrefixImages(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.querySelectorAll('img'));
  
  // Convertit toutes les images distantes du CV en Base64 local
  await Promise.all(imgs.map(img => convertImgToBase64(img)));

  // Attend la confirmation finale du rendu par le navigateur
  await Promise.all(
    imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
        setTimeout(() => resolve(), 3000); // Sécurité anti-blocage
      });
    })
  );
}

/**........................................................................ */

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Ouvre le PDF dans un nouvel onglet (iOS Safari ne supporte pas l'attribut
 * download sur les blobs, ce qui fait que pdf.save() ne télécharge rien).
 * Sur les autres plateformes on utilise pdf.save() classique.
 */
function savePDF(pdf: import('jspdf').jsPDF, filename: string): void {
  if (isIOS) {
    // Ouvre le PDF directement dans Safari → l'utilisateur peut l'enregistrer
    // via le bouton partage natif iOS
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl as unknown as string, '_blank');
  } else {
    pdf.save(filename);
  }
}

/**
 * Vérifie si une dataURL produite par html-to-image est blanche / vide
 * (problème connu sur Safari WebKit avec foreignObject SVG).
 */
async function isImageBlank(dataUrl: string): Promise<boolean> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = Math.min(img.width, 100);
      canvas.height = Math.min(img.height, 100);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(false);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      // Si tous les pixels sont blancs ou transparents → image vide
      const isBlank = Array.from(data).every((v, i) => i % 4 === 3 ? true : v === 255);
      resolve(isBlank);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

export async function downloadCVAsPDF(
  elementId: string,
  filename = 'mon-cv.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} introuvable`);

  // 1. Localise les images distantes en Base64 (règle CORS mobile)
  await prepareAndPrefixImages(element);

  // Neutralise le transform de zoom pendant la capture pour avoir les vraies dimensions A4
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;
  element.style.transform = 'none';
  element.style.transition = 'none';
  void element.offsetHeight; // force reflow

  let dataUrl: string;
  try {
    const htmlToImage = await import('html-to-image');

    const captureOptions = {
      pixelRatio: isMobile ? 1.5 : 3,
      backgroundColor: '#FFFFFF',
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: { transform: 'none' },
      skipFonts: false,
      cacheBust: true,
    };

    dataUrl = await htmlToImage.toPng(element, captureOptions);

    // Sur Safari/WebKit, foreignObject SVG peut produire une image blanche.
    // On relance une deuxième fois si c'est le cas (deuxième tentative suffit généralement).
    if (await isImageBlank(dataUrl)) {
      await new Promise(r => setTimeout(r, 200));
      dataUrl = await htmlToImage.toPng(element, captureOptions);
    }
  } finally {
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
  }

  // Dimensions exactes de l'image capturée
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const { default: jsPDF } = await import('jspdf');

  const A4_W = 210; // mm
  const A4_H = 297; // mm

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const imgW = A4_W;
  const imgH = (img.height / img.width) * A4_W;

  if (imgH > A4_H) {
    let yOffset = 0;
    while (yOffset < imgH) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, -yOffset, imgW, imgH);
      yOffset += A4_H;
    }
  } else {
    pdf.addImage(dataUrl, 'PNG', 0, 0, imgW, imgH);
  }

  savePDF(pdf, filename);
}
