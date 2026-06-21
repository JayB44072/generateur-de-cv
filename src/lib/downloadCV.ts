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
 * Sur iOS Safari, l'attribut `download` est ignoré → pdf.save() ouvre le blob
 * dans le même onglet sans proposer d'enregistrement. On ouvre dans un nouvel
 * onglet à la place : l'utilisateur peut ensuite utiliser le bouton partage iOS.
 */
function savePDF(pdf: import('jspdf').jsPDF, filename: string): void {
  if (isIOS) {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl as unknown as string, '_blank');
  } else {
    pdf.save(filename);
  }
}

export async function downloadCVAsPDF(
  elementId: string,
  filename = 'mon-cv.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} introuvable`);

  // Convertit les images distantes en Base64 pour éviter les blocages CORS mobile
  await prepareAndPrefixImages(element);

  const htmlToImage = await import('html-to-image');

  // skipFonts: true sur TOUTES les plateformes.
  // L'app charge Inter/Playfair/Fira Code depuis fonts.gstatic.com (Google Fonts).
  // Quand skipFonts est false, html-to-image tente de fetcher ces fichiers en JS
  // pour les encoder en base64 dans le SVG. Ce fetch échoue silencieusement
  // (CORS différent entre <link> CSS et fetch() JS) → SVG rendu entièrement blanc.
  // Avec skipFonts: true, le navigateur utilise les polices système déjà chargées
  // dans la page (Inter est déjà présent via le <link> du <head>) → rendu correct.
  const captureOptions = {
    pixelRatio: isMobile ? 1 : 3,
    backgroundColor: '#FFFFFF',
    width: element.scrollWidth,
    height: element.scrollHeight,
    skipFonts: true,
    cacheBust: true,
  };

  // html-to-image sérialise le DOM en SVG foreignObject puis demande au moteur
  // natif du navigateur de le dessiner. Sur certains Chrome Android, le premier
  // appel peut échouer à cause d'un race condition interne. On lance jusqu'à
  // 3 tentatives avec un délai croissant avant de déclarer l'échec.
  let dataUrl = '';
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      dataUrl = await htmlToImage.toPng(element, captureOptions);
      if (dataUrl && dataUrl.length > 5000) break; // image non vide → succès
      // Image suspicieusement petite (probable canvas vide) → on réessaie
      await new Promise(r => setTimeout(r, attempt * 150));
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, attempt * 150));
    }
  }

  if (!dataUrl || dataUrl.length < 5000) {
    throw lastError ?? new Error('html-to-image a produit une image vide après 3 tentatives');
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const { default: jsPDF } = await import('jspdf');

  const A4_W_MM = 210;
  const A4_H_MM = 297;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  // On place toujours l'image sur la largeur exacte de l'A4 (210mm).
  // La hauteur est calculée en respectant le ratio pixel de l'image capturée
  // → pas d'étirement, les proportions du CV sont préservées.
  const imgW = A4_W_MM;
  const imgH = (img.height / img.width) * A4_W_MM;

  if (imgH > A4_H_MM) {
    // CV multi-page : on découpe l'image en tranches de 297mm
    let yOffset = 0;
    while (yOffset < imgH) {
      if (yOffset > 0) pdf.addPage();
      // Placement de l'image entière décalée vers le haut pour que la tranche
      // correspondant à la page courante soit visible dans la fenêtre A4
      pdf.addImage(dataUrl, 'PNG', 0, -yOffset, imgW, imgH);
      yOffset += A4_H_MM;
    }
  } else {
    // CV tenant sur une seule page : on le centre verticalement si plus court que A4
    const yMargin = (A4_H_MM - imgH) / 2;
    pdf.addImage(dataUrl, 'PNG', 0, yMargin > 4 ? 0 : 0, imgW, imgH);
  }

  savePDF(pdf, filename);
}
