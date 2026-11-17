# Matemática Challenge

Aplicación educativa PWA para practicar ecuaciones lineales y cuadráticas. Está construida con HTML, CSS y JavaScript sin dependencias externas.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub.
2. Sube todos los archivos y carpetas de este proyecto conservando su estructura.
3. Antes de publicar, abre `app.js` y cambia `TEACHER_PIN = '2468'` por un PIN propio.
4. En GitHub, entra a **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**, elige `main` y la carpeta `/ (root)`, y guarda.
6. Espera la publicación y abre la URL HTTPS que GitHub Pages proporciona.

## Instalar en teléfonos

- **Android:** abre la web en Chrome y usa “Instalar aplicación” o “Agregar a pantalla de inicio”.
- **iPhone/iPad:** abre la web en Safari, toca Compartir y selecciona “Agregar a pantalla de inicio”.

## Funciones incluidas

- Acceso de estudiante con nombre.
- Panel docente protegido por PIN local.
- Retos de ecuaciones lineales y cuadráticas.
- Creación, activación y eliminación de retos personalizados.
- Puntuación local y registro de intentos.
- Exportación de resultados a CSV.
- Caché para funcionamiento básico sin conexión después de la primera carga.

## Importante: alcance de esta versión

Esta entrega es una PWA frontend. Los datos se guardan en `localStorage` del navegador/dispositivo. Por tanto, el panel del profesor solo muestra resultados generados en ese mismo navegador y no existe sincronización entre teléfonos ni autenticación segura real. El PIN en JavaScript es una barrera demostrativa, no un sistema de seguridad. Para uso institucional con múltiples estudiantes y docentes se debe añadir un backend y una base de datos con autenticación y reglas de acceso.
