. # 🗺️ Integración de Google Maps - Guía de Implementación

## ✅ ¿Qué se ha implementado?

### 1. **Selector de Ubicación con Mapa Interactivo**
- Componente reutilizable `MapLocationPickerComponent` 
- Integrado en el formulario de creación/edición de empresas
- Características:
  - 🔍 Barra de búsqueda de ubicaciones
  - 📍 Click en el mapa para seleccionar ubicación
  - 🖱️ Marcador arrastrable para ajustar posición
  - ✅ Visualización de coordenadas seleccionadas
  - 📝 Instrucciones integradas

### 2. **Mapa de Empresas Cercanas**
- Nuevo componente `MapaEmpresasComponent` en el dashboard
- Características:
  - 🌍 Muestra todas las empresas con ubicación en el mapa
  - 📍 Detecta automáticamente tu ubicación actual
  - 📏 Filtro por radio de distancia (1km - 100km)
  - 🎯 Cálculo de distancia desde tu ubicación
  - 🗺️ Mapa interactivo con marcadores
  - 📝 Sidebar con lista de empresas ordenadas por distancia
  - 🔵 Marcador azul para tu ubicación
  - 🔴 Marcadores rojos para empresas
  - ℹ️ Info windows con detalles de cada empresa

## 📋 Estructura de Archivos

```
src/
├── environments/
│   ├── environment.ts                    # ✅ Configuración con API Key
│   └── environment.prod.ts               # ✅ Configuración de producción
├── index.html                            # ✅ Script de Google Maps
├── app/
│   ├── shared/components/
│   │   └── map-location-picker/
│   │       └── map-location-picker.component.ts  # ✅ Selector de ubicación
│   └── modules/dashboard/components/
│       ├── empresa-form/
│       │   ├── empresa-form.component.ts         # ✅ Actualizado con mapa
│       │   └── empresa-form.component.html       # ✅ Modal con mapa
│       └── mapa-empresas/
│           ├── mapa-empresas.component.ts        # ✅ Mapa de empresas
│           ├── mapa-empresas.component.html
│           └── mapa-empresas.component.css
```

## 🔑 Configuración de API Key

Tu API key ya está configurada en:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `src/index.html`

**API Key actual:** `AIzaSyA78EEPq6tOPPkPRDvocl9bwTMXsFVlO-E`

### ⚠️ Importante sobre la API Key

Para que funcione correctamente, debes habilitar estas APIs en Google Cloud Console:
1. Maps JavaScript API
2. Places API
3. Geocoding API (opcional, para búsquedas avanzadas)

**Pasos:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "APIs y servicios" > "Biblioteca"
4. Busca y habilita cada API mencionada
5. Configura restricciones de dominio para tu API Key (recomendado para producción)

## 🚀 Cómo Usar

### En el Formulario de Empresa

1. **Crear/Editar Empresa:**
   - Llena los campos básicos (nombre, descripción, etc.)
   - En la sección "Ubicación", haz click en "Seleccionar Ubicación en el Mapa"
   - Se abrirá un modal con el mapa interactivo

2. **Seleccionar Ubicación en el Mapa:**
   - **Opción 1:** Escribe la dirección en la barra de búsqueda
   - **Opción 2:** Navega por el mapa y haz click donde está tu negocio
   - **Opción 3:** Arrastra el marcador para ajustar la posición exacta
   - Las coordenadas se actualizan automáticamente
   - Click en "Guardar Ubicación" para confirmar

3. **Editar/Eliminar Ubicación:**
   - Si ya hay ubicación guardada, verás las coordenadas
   - Botón "Cambiar" para abrir el mapa nuevamente
   - Botón "Limpiar" para eliminar la ubicación

### En el Mapa de Empresas Cercanas

1. **Acceder al Mapa:**
   - Desde el dashboard, click en "Mapa de Empresas" en el menú lateral
   - O navega a `/dashboard/mapa-empresas`

2. **Funcionalidades:**
   - El mapa detecta tu ubicación automáticamente
   - Selecciona el radio de búsqueda (1km - 100km)
   - Ve empresas ordenadas por distancia en el sidebar
   - Click en una empresa del sidebar para centrar el mapa en ella
   - Click en un marcador en el mapa para ver detalles
   - Click en "Ver detalles" para ir a la página de la empresa

3. **Marcadores:**
   - 🔵 **Azul:** Tu ubicación actual
   - 🔴 **Rojo:** Empresas con ubicación guardada

## 🔧 Funciones Técnicas Implementadas

### MapLocationPickerComponent
```typescript
// Métodos principales:
- loadMap(): Inicializa Google Maps
- initMap(): Configura el mapa y marcadores
- updateSelectedLocation(): Actualiza coordenadas seleccionadas
- locationSelected: EventEmitter con lat/lng
```

### MapaEmpresasComponent
```typescript
// Métodos principales:
- getUserLocation(): Obtiene ubicación del usuario
- loadEmpresas(): Carga empresas con coordenadas
- filterEmpresasByDistance(): Filtra por radio
- calculateDistance(): Fórmula de Haversine para distancia
- centerOnEmpresa(): Centra mapa en empresa seleccionada
```

## 📱 Permisos de Ubicación

El componente de mapa solicita permisos de geolocalización:
- Si el usuario **acepta**: Se usa su ubicación real
- Si el usuario **rechaza**: Se usa ubicación por defecto (Lima, Peru)
- Coordenadas por defecto: `{ lat: -12.046374, lng: -77.042793 }`

Puedes cambiar la ubicación por defecto en:
```typescript
// mapa-empresas.component.ts - línea ~78
this.userLocation.set({ lat: -12.046374, lng: -77.042793 });
```

## 🎨 Personalización

### Cambiar el estilo del mapa:
```typescript
// En initMap() de cualquier componente:
this.map = new window.google.maps.Map(mapContainer, {
  center: center,
  zoom: 15,
  styles: [...] // Agrega estilos personalizados aquí
});
```

### Cambiar iconos de marcadores:
```typescript
// Marcador personalizado:
const marker = new window.google.maps.Marker({
  icon: {
    url: 'ruta/a/tu/icono.png',
    scaledSize: new window.google.maps.Size(32, 32)
  }
});
```

## ✨ Mejoras Futuras Sugeridas

1. **Geocoding Reverse:** Convertir coordenadas a dirección legible
2. **Rutas:** Mostrar ruta desde ubicación del usuario a la empresa
3. **Clusters:** Agrupar marcadores cercanos cuando hay muchas empresas
4. **Street View:** Integrar vista de calle para las empresas
5. **Compartir Ubicación:** Generar enlaces de Google Maps para compartir
6. **Guardar Favoritos:** Marcar empresas favoritas en el mapa
7. **Filtros Avanzados:** Por categoría, rating, horario de apertura

## 🐛 Solución de Problemas

### El mapa no se muestra:
1. Verifica que tu API Key esté activa
2. Revisa que las APIs estén habilitadas en Google Cloud
3. Abre la consola del navegador (F12) para ver errores
4. Verifica que el script de Google Maps se cargue en index.html

### La búsqueda no funciona:
- Asegúrate de tener habilitada la "Places API" en Google Cloud

### Las coordenadas no se guardan:
- Verifica que el backend acepte los campos `latitud` y `longitud` como números
- Revisa que la conversión a Number esté funcionando en el formulario

### El mapa se ve gris:
- Puede ser un problema de billing en Google Cloud
- Verifica que tu proyecto tenga una cuenta de facturación activa

## 📞 Rutas Agregadas

```typescript
// app.routes.ts
{ 
  path: 'dashboard/mapa-empresas', 
  component: MapaEmpresasComponent 
}
```

## 🎉 ¡Listo para usar!

Ahora tu aplicación tiene:
- ✅ Selector de ubicación interactivo en formularios
- ✅ Mapa de empresas cercanas con filtro de distancia
- ✅ Búsqueda de lugares con autocompletado
- ✅ Cálculo automático de distancias
- ✅ Interfaz intuitiva y responsiva

**Próximo paso:** Inicia tu servidor de desarrollo y prueba las nuevas funcionalidades:
```bash
ng serve
```

Luego navega a:
- Formulario: `http://localhost:4200/dashboard/empresas/nueva`
- Mapa: `http://localhost:4200/dashboard/mapa-empresas`
