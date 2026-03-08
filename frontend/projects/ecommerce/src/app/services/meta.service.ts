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

  actualizarTitulo(titulo: string) {
    this.title.setTitle(`${titulo} | NobleStep Shop`);
  }

  actualizarMetaEtiquetas(config: {
    titulo?: string;
    descripcion?: string;
    imagen?: string;
    url?: string;
    tipo?: string;
  }) {
    if (config.titulo) {
      this.title.setTitle(`${config.titulo} | NobleStep Shop`);
      this.meta.updateTag({ name: 'title', content: config.titulo });
      this.meta.updateTag({ property: 'og:title', content: config.titulo });
      this.meta.updateTag({ name: 'twitter:title', content: config.titulo });
    }

    if (config.descripcion) {
      this.meta.updateTag({ name: 'description', content: config.descripcion });
      this.meta.updateTag({ property: 'og:description', content: config.descripcion });
      this.meta.updateTag({ name: 'twitter:description', content: config.descripcion });
    }

    if (config.imagen) {
      this.meta.updateTag({ property: 'og:image', content: config.imagen });
      this.meta.updateTag({ name: 'twitter:image', content: config.imagen });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    if (config.tipo) {
      this.meta.updateTag({ property: 'og:type', content: config.tipo });
    }

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  establecerMetaProducto(producto: { nombre: string; descripcion: string; precioVenta: number; urlImagen?: string }) {
    this.actualizarMetaEtiquetas({
      titulo: producto.nombre,
      descripcion: `${producto.descripcion} - S/ ${producto.precioVenta.toFixed(2)}`,
      imagen: producto.urlImagen || '/logo.svg',
      tipo: 'product'
    });

    // Schema.org structured data for product
    this.agregarEsquemaProducto(producto);
  }

  establecerMetaCategoria(nombreCategoria: string, descripcion: string) {
    this.actualizarMetaEtiquetas({
      titulo: `${nombreCategoria} - Catálogo`,
      descripcion: descripcion || `Explora nuestra colección de ${nombreCategoria}`,
      tipo: 'website'
    });
  }

  establecerMetaPorDefecto() {
    this.actualizarMetaEtiquetas({
      titulo: 'NobleStep Shop',
      descripcion: 'Calzado de calidad para toda ocasión. Encuentra los mejores zapatos, zapatillas y más en NobleStep.',
      tipo: 'website'
    });
  }

  private agregarEsquemaProducto(producto: any) {
    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': producto.nombre,
      'description': producto.descripcion,
      'image': producto.urlImagen || '/logo.svg',
      'offers': {
        '@type': 'Offer',
        'price': producto.precioVenta,
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
