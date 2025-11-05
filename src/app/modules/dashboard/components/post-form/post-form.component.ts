import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PostsService } from '../../../../core/services/posts.service';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { Post } from '../../../../core/models/post.model';
import { Empresa } from '../../../../core/models/empresa.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';
import { ImageUploadComponent, UploadResult } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorAlertComponent, ImageUploadComponent],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css'
})
export class PostFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  private empresasService = inject(EmpresasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = signal(false);
  error = signal('');
  postId: number | null = null;
  isEditMode = false;
  empresas = signal<Empresa[]>([]);
  loadingEmpresas = signal(true);
  empresaIdFromRoute: number | null = null; // ID de empresa desde la ruta

  ngOnInit() {
    this.initForm();
    
    // Obtener empresaId de la ruta si existe
    const empresaId = this.route.snapshot.paramMap.get('empresaId');
    if (empresaId) {
      this.empresaIdFromRoute = +empresaId;
      this.form.patchValue({ empresaId: this.empresaIdFromRoute });
      this.form.get('empresaId')?.disable(); // Deshabilitar selector si viene desde empresa específica
    } else {
      this.loadEmpresas(); // Solo cargar lista si no viene desde empresa específica
    }
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('postId') || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postId = +id;
      this.isEditMode = true;
      this.loadPost(this.postId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      contenido: ['', [Validators.required, Validators.minLength(20)]],
      urlImagen: [''], // Sin validador requerido, solo opcional
      empresaId: [null, Validators.required]
    });
  }

  loadEmpresas() {
    this.loadingEmpresas.set(true);
    this.empresasService.getAll().subscribe({
      next: (data: Empresa[]) => {
        this.empresas.set(data);
        this.loadingEmpresas.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar empresas');
        this.loadingEmpresas.set(false);
      }
    });
  }

  loadPost(id: number) {
    this.loading.set(true);
    this.postsService.getById(id).subscribe({
      next: (post: Post) => {
        this.form.patchValue({
          titulo: post.titulo,
          contenido: post.contenido,
          urlImagen: post.urlImagen || post.imagenUrl,
          empresaId: post.empresaId
        });
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar el post');
        this.loading.set(false);
      }
    });
  }

  onImageUploaded(result: UploadResult) {
    this.form.patchValue({ urlImagen: result.url });
    console.log('✅ Imagen del post actualizada:', result.url);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formValue = this.form.getRawValue(); // getRawValue incluye campos deshabilitados
    
    // Preparar datos asegurando tipos correctos
    const postData: any = {
      titulo: formValue.titulo.trim(),
      contenido: formValue.contenido.trim(),
      empresaId: Number(formValue.empresaId)
    };

    // Solo agregar urlImagen si tiene valor válido (URL completa)
    const urlImagen = formValue.urlImagen?.trim();
    if (urlImagen && urlImagen.length > 0 && (urlImagen.startsWith('http://') || urlImagen.startsWith('https://'))) {
      postData.urlImagen = urlImagen;
    }

    console.log('📤 Datos del post a enviar:', postData);
    console.log('🔍 urlImagen:', postData.urlImagen || 'sin imagen');
    console.log('🔍 empresaId (type):', typeof postData.empresaId, postData.empresaId);

    const request = this.isEditMode && this.postId
      ? this.postsService.update(this.postId, postData)
      : this.postsService.create(postData);

    request.subscribe({
      next: () => {
        // Redirigir según si viene de empresa específica o no
        if (this.empresaIdFromRoute) {
          this.router.navigate(['/dashboard/empresas', this.empresaIdFromRoute]);
        } else {
          this.router.navigate(['/dashboard/posts']);
        }
      },
      error: (err: any) => {
        const errorMsg = err.error?.message 
          ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
          : 'Error al guardar el post';
        this.error.set(errorMsg);
        this.loading.set(false);
        console.error('❌ Error al guardar post:', err);
        console.error('❌ Datos enviados:', postData);
      }
    });
  }

  cancel() {
    if (this.empresaIdFromRoute) {
      this.router.navigate(['/dashboard/empresas', this.empresaIdFromRoute]);
    } else {
      this.router.navigate(['/dashboard/posts']);
    }
  }
}
