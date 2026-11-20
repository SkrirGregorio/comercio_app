/**
 * Datos que aparecen en la Política de Privacidad y en los Términos y Condiciones.
 * Al cambiar el contenido de cualquiera de las dos páginas, actualiza `ultimaActualizacion`.
 */
export const LEGAL = {
  plataforma: 'Comercio Local',
  responsable: 'Jonathan Josué Mendizabal Gregorio',
  institucion: 'Universidad Panamericana, Facultad de Ingeniería y Ciencias Aplicadas',

  /**
   * Correo real para consultas y para ejercer derechos sobre los datos.
   * TODO antes del despliegue: definir el correo definitivo.
   */
  correoContacto: '',

  /** Región de Google Cloud donde se alojan la API, la base de datos y los archivos. */
  regionDatos: 'Estados Unidos (Google Cloud, región us-central1, Iowa)',

  /** Plazo para atender solicitudes de acceso, corrección o eliminación. */
  plazoSolicitudesDias: 30,

  /** Duración de la sesión (expiración del token JWT en la API). */
  duracionSesion: '2 días',

  // Mes base 0: new Date(2026, 10, 20) = 20 de noviembre de 2026 (hora local, sin desfase UTC)
  ultimaActualizacion: new Date(2026, 10, 20),
} as const;
