import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
  constructor(private metaService: MetaService) {}

  ngOnInit() {
    this.metaService.actualizarMetaEtiquetas({
      titulo: 'Términos y Condiciones - NobleStep',
      descripcion: 'Consulta los términos y condiciones de compra en NobleStep.',
      tipo: 'website'
    });
  }
}
