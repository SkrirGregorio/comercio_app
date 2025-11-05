import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { EmpresaCardComponent } from '../empresa-card/empresa-card.component';
import { EmpresasService } from '../../../../core/services/empresas.service';
import type { Empresa } from '../../../../core/models/empresa.model';

@Component({
  selector: 'app-empresas-list',
  standalone: true,
  imports: [AsyncPipe, EmpresaCardComponent],
  templateUrl: './empresas-list.component.html',
  styleUrl: './empresas-list.component.css'
})
export class EmpresasListComponent {
  private readonly empresasSvc = inject(EmpresasService);
  readonly empresas$ = this.empresasSvc.list();
}
