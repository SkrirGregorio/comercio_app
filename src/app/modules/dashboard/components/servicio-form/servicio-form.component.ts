import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiciosService } from '../../../../core/services/servicios.service';
import { Servicio } from '../../../../core/models/servicio.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorAlertComponent],
  templateUrl: './servicio-form.component.html',
  styleUrl: './servicio-form.component.css'
})
export class ServicioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviciosService = inject(ServiciosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = signal(false);
  error = signal('');
  servicioId: number | null = null;
  isEditMode = false;
  empresaIdFromRoute: number | null = null;

  ngOnInit() {
    this.initForm();
    
    // Obtener empresaId de la ruta
    const empresaId = this.route.snapshot.paramMap.get('empresaId');
    if (empresaId) {
      this.empresaIdFromRoute = +empresaId;
    }
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('servicioId') || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicioId = +id;
      this.isEditMode = true;
      this.loadServicio(this.servicioId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.minLength(10)]]
    });
  }

  loadServicio(id: number) {
    this.loading.set(true);
    this.serviciosService.getById(id).subscribe({
      next: (servicio: Servicio) => {
        this.form.patchValue({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion
        });
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar el servicio');
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const servicioData = {
      nombre: this.form.value.nombre.trim(),
      descripcion: this.form.value.descripcion?.trim() || ''
    };

    console.log('📤 Datos del servicio a enviar:', servicioData);

    const request = this.isEditMode && this.servicioId
      ? this.serviciosService.update(this.servicioId, servicioData)
      : this.serviciosService.create(servicioData);

    request.subscribe({
      next: () => {
        if (this.empresaIdFromRoute) {
          this.router.navigate(['/dashboard/empresas', this.empresaIdFromRoute], { 
            queryParams: { tab: 'servicios' }
          });
        } else {
          this.router.navigate(['/dashboard/empresas']);
        }
      },
      error: (err: any) => {
        const errorMsg = err.error?.message 
          ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
          : 'Error al guardar el servicio';
        this.error.set(errorMsg);
        this.loading.set(false);
        console.error('❌ Error al guardar servicio:', err);
      }
    });
  }

  cancel() {
    if (this.empresaIdFromRoute) {
      this.router.navigate(['/dashboard/empresas', this.empresaIdFromRoute], { 
        queryParams: { tab: 'servicios' }
      });
    } else {
      this.router.navigate(['/dashboard/empresas']);
    }
  }
}
