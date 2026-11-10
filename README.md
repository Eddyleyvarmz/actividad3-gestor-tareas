# TaskFlow — Gestor de tareas

Aplicación web del lado del cliente desarrollada con **HTML5, CSS3 y JavaScript ES6+**. Permite administrar tareas sin utilizar un servidor: los registros se guardan en `localStorage` y permanecen en el navegador después de cerrar o actualizar la página.

## 1. Funcionalidades

- **Agregar tareas:** nombre obligatorio, descripción opcional, categoría, prioridad y fecha límite.
- **Visualizar tareas:** listado dinámico que se actualiza sin recargar la página.
- **Editar tareas:** carga la información en el formulario y guarda los cambios.
- **Eliminar tareas:** eliminación individual con confirmación.
- **Completar tareas:** cambia el estado mediante una casilla.
- **Búsqueda:** encuentra registros por nombre o descripción.
- **Filtros:** muestra todas, pendientes o completadas; también permite filtrar por categoría.
- **Ordenamiento:** las tareas pendientes aparecen primero y se priorizan las de nivel alto.
- **Indicadores:** muestra total, pendientes, completadas y porcentaje de avance.
- **Persistencia local:** recupera los registros desde `localStorage` al iniciar.
- **Validación:** evita nombres vacíos y nombres con menos de 3 o más de 80 caracteres.

## 2. Requisitos

- Navegador actualizado (Chrome, Edge, Firefox o similar).
- No requiere instalación de dependencias, base de datos ni servidor.
- Conexión a internet únicamente para cargar las fuentes tipográficas externas; la aplicación funciona sin ellas.

## 3. Cómo ejecutar el proyecto

1. Descarga o clona este repositorio.
2. Abre la carpeta `actividad3-gestor-tareas`.
3. Abre `index.html` en el navegador.
4. Registra una tarea y prueba las opciones de editar, completar, buscar y eliminar.
5. Actualiza la página: los registros deben continuar visibles porque se almacenan en `localStorage`.

También puedes abrir la carpeta con Visual Studio Code y utilizar la extensión **Live Server** para ejecutar `index.html` en un servidor local.

> Nota: `localStorage` es propio del navegador y del origen desde el que se abre el proyecto. Los datos no se sincronizan entre dispositivos ni entre navegadores. Al borrar los datos del sitio, también se pueden eliminar las tareas guardadas.

## 4. Estructura del proyecto

```text
actividad3-gestor-tareas/
├── index.html   # Estructura y formulario de la aplicación
├── styles.css   # Diseño adaptable a escritorio y móvil
├── app.js       # Lógica, DOM, eventos, validación y localStorage
├── README.md    # Documentación del proyecto
└── .gitignore   # Archivos que Git debe ignorar
```

## 5. Modelo de datos

Cada tarea se almacena como un objeto dentro del arreglo `tasks`:

```js
{
  id: "identificador-unico",
  title: "Terminar actividad de JavaScript",
  description: "Crear el gestor de tareas",
  category: "Escuela",
  priority: "Alta",
  dueDate: "2026-11-15",
  completed: false,
  createdAt: "2026-11-09T18:00:00.000Z"
}
```

El arreglo se convierte a texto JSON con `JSON.stringify()` para guardarse en `localStorage`. Al iniciar, `JSON.parse()` recupera los objetos.

## 6. Correspondencia con los temas de la actividad

| Requisito | Implementación |
|---|---|
| Objetos y arreglos | Cada tarea es un objeto; `tasks` es el arreglo principal. |
| Agregar, visualizar, editar y eliminar | `handleFormSubmit()`, `render()`, `startEditing()` y `deleteTask()`. |
| Manipulación del DOM | `querySelector()`, `createElement()`, `textContent()`, `replaceChildren()` y atributos. |
| Eventos | `submit`, `click`, `change` e `input`; se utiliza delegación de eventos en la lista. |
| JavaScript moderno | `const`, `let`, arrow functions, template literals, spread operator y optional chaining. |
| Métodos de arreglos | `map()`, `filter()`, `find()`, `some()` y `sort()`. |
| Validación | `validateTask()` comprueba que el nombre tenga entre 3 y 80 caracteres. |
| Persistencia local | `loadTasks()` y `saveTasks()` utilizan `localStorage`. |
| Funcionalidad adicional | Búsqueda, filtros, ordenamiento y contadores de progreso. |

## 7. Pruebas recomendadas

1. Intentar guardar el formulario vacío: debe aparecer un mensaje de validación.
2. Intentar registrar un nombre de 1 o 2 caracteres: debe rechazarse.
3. Agregar tareas con diferentes categorías y prioridades.
4. Editar una tarea y confirmar que cambió su información.
5. Marcar una tarea como completada y comprobar los contadores.
6. Buscar una palabra y aplicar los filtros de estado y categoría.
7. Eliminar una tarea y confirmar que desapareció.
8. Actualizar el navegador y comprobar que las tareas siguen guardadas.

## 8. Publicar en GitHub

Desde una terminal abierta en la carpeta del proyecto, ejecuta:

```bash
git init
git add .
git commit -m "Actividad 3: gestor de tareas con JavaScript moderno"
git branch -M main
git remote add origin https://github.com/USUARIO/actividad3-gestor-tareas.git
git push -u origin main
```

Antes del último comando, crea un repositorio vacío en GitHub y reemplaza `USUARIO` por tu nombre de usuario. No agregues un token o contraseña al código ni al repositorio.

## 9. Guion para la demostración (3 minutos)

| Tiempo | Qué mostrar y explicar |
|---|---|
| 0:00–0:25 | Presentar TaskFlow y explicar que es una aplicación del lado del cliente, sin servidor. |
| 0:25–1:00 | Agregar una tarea con nombre, descripción, categoría, prioridad y fecha. Mostrar la validación intentando guardar un nombre vacío. |
| 1:00–1:35 | Editar una tarea, guardar los cambios y marcar otra como completada. Señalar cómo cambian los contadores y el porcentaje. |
| 1:35–2:10 | Buscar una tarea y aplicar filtros de estado y categoría. Explicar que se utilizan métodos como `filter()` y `sort()`. |
| 2:10–2:40 | Eliminar una tarea y actualizar la página para demostrar que los registros permanecen guardados. |
| 2:40–3:00 | Mostrar brevemente `app.js` y mencionar objetos, arreglos, eventos, manipulación del DOM y `localStorage`. |

## 10. Autor

- **Estudiante:** Edgar Eduardo Leyva Ramirez
- **Matricula** 1939283
- **Materia:** LAB Porgramacion WEB
- **Actividad:** Actividad 3. Aplicación interactiva con JavaScript moderno
- **Fecha:** 09/11/2026
