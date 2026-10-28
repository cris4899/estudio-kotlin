# Estudio Kotlin

Web de repaso en español basada en apuntes de Kotlin y Android: 11 lecciones, 73 preguntas tipo test y 6 ejercicios de código.

## Usar

Abre `web/index.html` en un navegador. No necesita instalación ni conexión. El progreso se guarda localmente en el navegador. Los ejercicios Kotlin incluyen soluciones y criterios de revisión; no se ejecutan ni se corrigen automáticamente.

## Comprobar

```sh
node web/check.cjs
```

## Desplegar

Proyecto estático sin dependencias ni compilación. `vercel.json` publica el directorio `web`. Las copias de los cuatro PDF utilizados están en `web/apuntes` para conservar los enlaces a las fuentes. El resto del material original y los archivos temporales no forman parte del repositorio.

Incluye un acceso específico a 40 preguntas de «¿Qué hace esta función?», con cuatro opciones, una respuesta válida y explicación, sobre el mismo temario.
