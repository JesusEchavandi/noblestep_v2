import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  updateTitle(title: string) {
    this.title.setTitle(`${title} | NobleStep Shop`);
  }

  updateMetaTags(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    if (config.title) {
      this.title.setTitle(`${config.title} | NobleStep Shop`);
      this.meta.updateTag({ name: 'title', content: config.title });
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    if (config.type) {
      this.meta.updateTag({ property: 'og:type', content: config.type });
    }

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  setProductMeta(product: { name: string; description: string; salePrice: number; imageUrl?: string }) {
    this.updateMetaTags({
      title: product.name,
      description: `${product.description} - S/ ${product.salePrice.toFixed(2)}`,
      image: product.imageUrl || '/logo.svg',
      type: 'product'
    });

    // Schema.org structured data for product
    this.addProductSchema(product);
  }

  setCategoryMeta(categoryName: string, description: string) {
    this.updateMetaTags({
      title: `${categoryName} - Catálogo`,
      description: description || `Explora nuestra colección de ${categoryName}`,
      type: 'website'
    });
  }

  setDefaultMeta() {
    this.updateMetaTags({
      title: 'NobleStep Shop',
      description: 'Calzado de calidad para toda ocasión. Encuentra los mejores zapatos, zapatillas y más en NobleStep.',
      type: 'website'
    });
  }

  private addProductSchema(product: any) {
    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': product.imageUrl || '/logo.svg',
      'offers': {
        '@type': 'Offer',
        'price': product.salePrice,
        'priceCurrency': 'PEN',
        'availability': 'https://schema.org/InStock'
      }
    };

    let scriptTag = document.getElementById('product-schema') as HTMLScriptElement | null;
    if (scriptTag) {
      scriptTag.innerHTML = JSON.stringify(schema);
    } else {
      scriptTag = document.createElement('script') as HTMLScriptElement;
      scriptTag.id = 'product-schema';
      scriptTag.type = 'application/ld+json';
      scriptTag.innerHTML = JSON.stringify(schema);
      document.head.appendChild(scriptTag);
    }
  }
}
