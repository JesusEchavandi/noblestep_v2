import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para resolución de imágenes de productos y categorías.
 *
 * Propósito:
 *   - Eliminar la duplicación de lógica de imágenes dispersa en home, catalog,
 *     cart, checkout, product-detail y category-grid.
 *   - Facilitar en el futuro el reemplazo de Unsplash por imágenes propias
 *     sin tener que modificar cada componente individualmente.
 *
 * Uso:
 *   constructor(private imageService: ImageService) {}
 *   src="{{ imageService.getProductImage(product) }}"
 */
@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private readonly BASE_URL = 'https://images.unsplash.com/';

  // Mapa centralizado: keyword → photo ID de Unsplash
  private readonly PRODUCT_IMAGE_MAP: { keywords: string[]; photoId: string }[] = [
    { keywords: ['running', 'runner'],                                    photoId: 'photo-1542291026-7eec264c27ff' },
    { keywords: ['sneaker', 'zapatilla'],                                 photoId: 'photo-1600185365483-26d7a4cc7519' },
    { keywords: ['formal', 'oxford', 'vestir', 'clásic', 'clasic'],      photoId: 'photo-1533867617858-e7b97e060509' },
    { keywords: ['bota', 'boot', 'botín', 'botin'],                      photoId: 'photo-1608256246200-53e635b5b65f' },
    { keywords: ['sandalia', 'sandal', 'ojota', 'verano'],               photoId: 'photo-1603487742131-4160ec999306' },
    { keywords: ['casual', 'loafer', 'mocasin', 'moccasin', 'slip'],     photoId: 'photo-1525966222134-fcfa99b8ae77' },
    { keywords: ['sport', 'gym', 'training', 'deportiv'],                photoId: 'photo-1606107557195-0e29a4b5b4aa' },
    { keywords: ['tacon', 'tacón', 'heel', 'stiletto'],                  photoId: 'photo-1543163521-1bf539c55dd2' },
    { keywords: ['niño', 'kids', 'infantil', 'bebe', 'bebé'],            photoId: 'photo-1555274175-6cbf6f3b137b' },
    { keywords: ['cuero', 'leather', 'piel'],                            photoId: 'photo-1491553895911-0055eca6402d' },
    { keywords: ['plataforma', 'platform'],                              photoId: 'photo-1595950653106-6c9ebd614d3a' },
    { keywords: ['balerin', 'flat', 'mule'],                             photoId: 'photo-1560343090-f0409e92791a' },
  ];

  private readonly FALLBACK_PHOTO_IDS: string[] = [
    'photo-1542291026-7eec264c27ff',
    'photo-1600185365483-26d7a4cc7519',
    'photo-1533867617858-e7b97e060509',
    'photo-1525966222134-fcfa99b8ae77',
    'photo-1606107557195-0e29a4b5b4aa',
    'photo-1491553895911-0055eca6402d',
  ];

  /**
   * Devuelve la URL de imagen de un producto.
   * Si el producto tiene imageUrl propia (HTTP), la usa directamente.
   * Si no, resuelve por keywords del nombre/categoría.
   */
  getProductImage(product: {
    imageUrl?: string | null;
    name?: string;
    categoryName?: string;
  }, width = 600, quality = 80): string {
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    const searchText = `${product.name ?? ''} ${product.categoryName ?? ''}`.toLowerCase();
    return this.resolveByKeywords(searchText, width, quality);
  }

  /**
   * Devuelve la URL de imagen de una categoría por su nombre.
   */
  getCategoryImage(categoryName: string, width = 600, quality = 80): string {
    return this.resolveByKeywords(categoryName.toLowerCase(), width, quality);
  }

  /**
   * URL de imagen de error/fallback universal.
   */
  getFallbackImage(width = 600, quality = 80): string {
    return this.buildUrl(this.FALLBACK_PHOTO_IDS[0], width, quality);
  }

  /**
   * Devuelve un array de URLs de galería para un producto.
   * Útil en la vista de detalle de producto.
   */
  getProductGallery(product: {
    imageUrl?: string | null;
    name?: string;
    categoryName?: string;
  }, count = 4, width = 700, quality = 80): string[] {
    const main = this.getProductImage(product, width, quality);
    const searchText = `${product.name ?? ''} ${product.categoryName ?? ''}`.toLowerCase();
    const photoId = this.resolvePhotoId(searchText);
    const fallbacks = this.FALLBACK_PHOTO_IDS
      .filter(id => id !== photoId)
      .slice(0, count - 1)
      .map(id => this.buildUrl(id, width, quality));
    return [main, ...fallbacks].slice(0, count);
  }

  // ── Métodos privados ────────────────────────────────────────────────────────

  private resolveByKeywords(text: string, width: number, quality: number): string {
    const photoId = this.resolvePhotoId(text);
    return this.buildUrl(photoId, width, quality);
  }

  private resolvePhotoId(text: string): string {
    for (const entry of this.PRODUCT_IMAGE_MAP) {
      if (entry.keywords.some(kw => text.includes(kw))) {
        return entry.photoId;
      }
    }
    // Fallback determinístico basado en hash del texto
    const hash = text.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return this.FALLBACK_PHOTO_IDS[hash % this.FALLBACK_PHOTO_IDS.length];
  }

  private buildUrl(photoId: string, width: number, quality: number): string {
    return `${this.BASE_URL}${photoId}?w=${width}&q=${quality}&fit=crop`;
  }
}
