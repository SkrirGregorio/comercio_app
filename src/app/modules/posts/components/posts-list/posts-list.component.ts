import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  templateUrl: './posts-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './posts-list.component.css'
})
export class PostsListComponent {}
