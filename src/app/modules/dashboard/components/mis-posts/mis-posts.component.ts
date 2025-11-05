import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../../../core/services/posts.service';
import { Post } from '../../../../core/models/post.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-mis-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ErrorAlertComponent],
  templateUrl: './mis-posts.component.html',
  styleUrl: './mis-posts.component.css'
})
export class MisPostsComponent implements OnInit {
  private postsService = inject(PostsService);

  posts = signal<Post[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  ngOnInit() {
    this.loadMisPosts();
  }

  loadMisPosts() {
    this.loading.set(true);
    this.postsService.getAll().subscribe({
      next: (data: Post[]) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar posts');
        this.loading.set(false);
      }
    });
  }

  deletePost(id: number) {
    if (confirm('¿Estás seguro de eliminar este post?')) {
      this.postsService.delete(id).subscribe({
        next: () => {
          this.posts.set(this.posts().filter(p => p.id !== id));
        },
        error: (err: any) => this.error.set('Error al eliminar post')
      });
    }
  }
}
