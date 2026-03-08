import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetaService } from '../../services/meta.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {
  constructor(private metaService: MetaService) {}

  ngOnInit() {
    this.metaService.actualizarMetaEtiquetas({
      titulo: 'Política de Privacidad - NobleStep',
      descripcion: 'Conoce cómo protegemos tu información personal en NobleStep.',
      tipo: 'website'
    });
  }
}
