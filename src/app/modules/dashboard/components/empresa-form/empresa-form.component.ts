import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { Empresa } from '../../../../core/models/empresa.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';
import { ImageUploadComponent, UploadResult } from '../../../../shared/components/image-upload/image-upload.component';
import { MapLocationPickerComponent } from '../../../../shared/components/map-location-picker/map-location-picker.component';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorAlertComponent, ImageUploadComponent, MapLocationPickerComponent],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.css'
})
export class EmpresaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresasService = inject(EmpresasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = signal(false);
  error = signal('');
  empresaId: number | null = null;
  isEditMode = false;
  showMapSelector = signal(false);

  // Opciones de horarios predefinidos
  horariosPreset = [
    { value: 'Lunes a Viernes: 8:00 AM - 5:00 PM', label: 'Lun-Vie 8:00 AM - 5:00 PM' },
    { value: 'Lunes a Viernes: 9:00 AM - 6:00 PM', label: 'Lun-Vie 9:00 AM - 6:00 PM' },
    { value: 'Lunes a Sábado: 8:00 AM - 6:00 PM', label: 'Lun-Sáb 8:00 AM - 6:00 PM' },
    { value: 'Lunes a Sábado: 9:00 AM - 7:00 PM', label: 'Lun-Sáb 9:00 AM - 7:00 PM' },
    { value: 'Lunes a Domingo: 10:00 AM - 8:00 PM', label: 'Todos los días 10:00 AM - 8:00 PM' },
    { value: '24 horas', label: 'Abierto 24 horas' },
    { value: 'custom', label: 'Personalizado...' }
  ];

  ngOnInit() {
    this.initForm();
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.empresaId = +id;
      this.isEditMode = true;
      this.loadEmpresa(this.empresaId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      direccion: ['', Validators.required],
      latitud: [null],
      longitud: [null],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      webSite: [''],
      horario: [''],
      horarioPreset: [''],
      urlAvatar: [''],
      urlPortada: ['']
    });
  }

  // Manejadores para upload de imágenes
  onAvatarUploaded(result: UploadResult) {
    this.form.patchValue({ urlAvatar: result.url });
    console.log('✅ Avatar URL actualizado:', result.url);
  }

  onPortadaUploaded(result: UploadResult) {
    this.form.patchValue({ urlPortada: result.url });
    console.log('✅ Portada URL actualizado:', result.url);
  }

  onHorarioPresetChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    
    if (value === 'custom') {
      // Permitir edición personalizada
      this.form.patchValue({ horario: '' });
    } else if (value) {
      // Usar preset
      this.form.patchValue({ horario: value });
    }
  }

  openMapSelector() {
    this.showMapSelector.set(true);
  }

  closeMapSelector() {
    this.showMapSelector.set(false);
  }

  onLocationSelected(location: { lat: number; lng: number }) {
    console.log('🎯 onLocationSelected called in EmpresaFormComponent:', location);
    this.form.patchValue({
      latitud: location.lat,
      longitud: location.lng
    });
    console.log('✅ Form patched. Current values:', {
      latitud: this.form.get('latitud')?.value,
      longitud: this.form.get('longitud')?.value
    });
  }

  saveMapLocation() {
    // La ubicación ya está guardada en el formulario
    this.closeMapSelector();
  }

  clearLocation() {
    this.form.patchValue({
      latitud: null,
      longitud: null
    });
  }

  loadEmpresa(id: number) {
    this.loading.set(true);
    this.empresasService.getById(id).subscribe({
      next: (empresa: Empresa) => {
        this.form.patchValue(empresa);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar la empresa');
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

    const formValue = this.form.value;
    
    // Preparar datos para enviar (excluir horarioPreset)
    const empresaData: any = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      direccion: formValue.direccion,
      telefono: formValue.telefono,
      email: formValue.email,
      webSite: formValue.webSite || undefined,
      horario: formValue.horario || undefined,
      urlAvatar: formValue.urlAvatar || undefined,
      urlPortada: formValue.urlPortada || undefined,
    };

    // Agregar latitud y longitud solo si están definidos
    if (formValue.latitud !== null && formValue.latitud !== undefined) {
      empresaData.latitud = Number(formValue.latitud);
    }
    if (formValue.longitud !== null && formValue.longitud !== undefined) {
      empresaData.longitud = Number(formValue.longitud);
    }
    
    console.log('� Datos a enviar:', empresaData);

    const request = this.isEditMode && this.empresaId
      ? this.empresasService.update(this.empresaId, empresaData)
      : this.empresasService.create(empresaData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/empresas']);
      },
      error: (err: any) => {
        this.error.set('Error al guardar la empresa');
        this.loading.set(false);
        console.error('❌ Error al guardar empresa:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/empresas']);
  }
}
