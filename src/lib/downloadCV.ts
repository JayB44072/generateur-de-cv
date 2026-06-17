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

export async function downloadCVAsPDF(
  elementId: string,
  filename = 'mon-cv.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} introuvable`);

  // await waitForImages(element);

  // 1. On nettoie et localise les images en Base64 avant toute capture
  await prepareAndPrefixImages(element);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // L'aperçu est affiché avec `transform: scale(x)` pour le zoom (60%, 80%...).
  // On neutralise temporairement le transform pendant la capture pour avoir
  // des dimensions et un rendu fidèles à la taille réelle A4, puis on le restaure.
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;
  element.style.transform = 'none';
  element.style.transition = 'none';
  void element.offsetHeight; // force reflow

  let dataUrl: string;
  try {
    const htmlToImage = await import('html-to-image');
    dataUrl = await htmlToImage.toPng(element, {
      // 🚀 pixelRatio à 1.5 ou 2 max sur Mobile pour éviter le crash mémoire RAM de Chrome Mobile
      pixelRatio: isMobile ? 1.5 : 3,
      backgroundColor: '#FFFFFF',
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: { transform: 'none' },
      skipFonts: false,
      // Cache-busting pour s'assurer que les photos distantes ne bloquent pas le rendu SVG
      cacheBust: true,
    });
  } finally {
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
  }

  // Charger le PNG résultant pour connaître ses dimensions exactes
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

  pdf.save(filename);
}
