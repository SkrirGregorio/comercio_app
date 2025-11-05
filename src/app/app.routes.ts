import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./modules/home/components/home.component').then(m => m.HomeComponent) },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./modules/auth/components/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./modules/auth/components/register/register.component').then(m => m.RegisterComponent) }
    ]
  },
  { path: 'empresas', loadComponent: () => import('./modules/empresas/components/empresas-list/empresas-list.component').then(m => m.EmpresasListComponent) },
  { path: 'empresas/mapa', loadComponent: () => import('./modules/empresas/components/mapa-empresas-publico/mapa-empresas-publico.component').then(m => m.MapaEmpresasPublicoComponent) },
  { path: 'empresas/:id', loadComponent: () => import('./modules/empresas/components/empresa-detail/empresa-detail.component').then(m => m.EmpresaDetailComponent) },
  { path: 'servicios', loadComponent: () => import('./modules/servicios/components/servicios-list/servicios-list.component').then(m => m.ServiciosListComponent) },
  { path: 'posts', loadComponent: () => import('./modules/posts/components/posts-list/posts-list.component').then(m => m.PostsListComponent) },
  {
    path: 'legal',
    children: [
      { path: 'terminos', loadComponent: () => import('./modules/legal/components/terminos/terminos.component').then(m => m.TerminosComponent) },
      { path: 'privacidad', loadComponent: () => import('./modules/legal/components/privacidad/privacidad.component').then(m => m.PrivacidadComponent) }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'empresas', pathMatch: 'full' },
      { path: 'empresas', loadComponent: () => import('./modules/dashboard/components/mis-empresas/mis-empresas.component').then(m => m.MisEmpresasComponent) },
      { path: 'empresas/nueva', loadComponent: () => import('./modules/dashboard/components/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent) },
      { path: 'empresas/editar/:id', loadComponent: () => import('./modules/dashboard/components/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent) },
      { path: 'empresas/:id', loadComponent: () => import('./modules/dashboard/components/empresa-detalle-dashboard/empresa-detalle-dashboard.component').then(m => m.EmpresaDetalleDashboardComponent) },
      { path: 'empresas/:empresaId/posts/nuevo', loadComponent: () => import('./modules/dashboard/components/post-form/post-form.component').then(m => m.PostFormComponent) },
      { path: 'empresas/:empresaId/posts/editar/:postId', loadComponent: () => import('./modules/dashboard/components/post-form/post-form.component').then(m => m.PostFormComponent) },
      { path: 'empresas/:empresaId/servicios/nuevo', loadComponent: () => import('./modules/dashboard/components/servicio-form/servicio-form.component').then(m => m.ServicioFormComponent) },
      { path: 'empresas/:empresaId/servicios/editar/:servicioId', loadComponent: () => import('./modules/dashboard/components/servicio-form/servicio-form.component').then(m => m.ServicioFormComponent) },
      { path: 'mapa-empresas', loadComponent: () => import('./modules/dashboard/components/mapa-empresas/mapa-empresas.component').then(m => m.MapaEmpresasComponent) },
      { path: 'posts', loadComponent: () => import('./modules/dashboard/components/mis-posts/mis-posts.component').then(m => m.MisPostsComponent) },
      { path: 'posts/nuevo', loadComponent: () => import('./modules/dashboard/components/post-form/post-form.component').then(m => m.PostFormComponent) },
      { path: 'posts/editar/:id', loadComponent: () => import('./modules/dashboard/components/post-form/post-form.component').then(m => m.PostFormComponent) },
      { path: 'resenas', loadComponent: () => import('./modules/dashboard/components/mis-resenas/mis-resenas.component').then(m => m.MisResenasComponent) },
      { path: 'usuarios', loadComponent: () => import('./modules/dashboard/components/admin-usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
      { path: 'configuracion', loadComponent: () => import('./modules/dashboard/components/mis-empresas/mis-empresas.component').then(m => m.MisEmpresasComponent) } // Placeholder
    ]
  },
  { path: '**', redirectTo: '' }
];