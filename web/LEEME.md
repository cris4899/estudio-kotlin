# Cuaderno local de Kotlin

Abre `index.html` con tu navegador. No necesitas instalar nada ni disponer de conexión a Internet.

- **Estudiar:** 11 bloques con explicaciones, ejemplos, resultados ocultos y preguntas de recuerdo.
- **Preguntas:** 73 preguntas tipo test, práctica por tema, repaso de fallos y simulacro con 8 preguntas tipo test + 1 ejercicio de escribir código + 1 de llamar a una función.
- **Código:** 6 ejercicios con una solución posible y criterios para revisarla. No se ejecuta ni se compila Kotlin en la web; esta parte se revisa manualmente.

Los enlaces de las lecciones abren las copias de los cuatro PDF utilizados, incluidas en `apuntes`. La web completa se puede abrir en local o servir como archivos estáticos.

El progreso se guarda en el almacenamiento local del navegador. Utiliza el mismo navegador y la misma ubicación del archivo para conservarlo. Si el navegador bloquea ese almacenamiento, se muestra un aviso y la web sigue funcionando durante la sesión. Los borradores de código solo duran durante la ronda.

Las preguntas son material de práctica adaptado a los apuntes, no preguntas oficiales del examen. Las cifras de aciertos solo corresponden al tipo test. El historial conserva los diez últimos simulacros.

## Comprobación técnica

Con Node disponible, ejecuta `node web/check.cjs` desde EstudioKotlin para comprobar el banco de preguntas y los flujos de corrección. No se necesitan paquetes adicionales.

Incluye un acceso específico a 40 preguntas de «¿Qué hace esta función?», con cuatro opciones, una respuesta válida y explicación, sobre el mismo temario.
