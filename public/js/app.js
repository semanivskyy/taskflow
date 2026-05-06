// ===== app.js - Lógica del cliente TaskFlow =====

const API_URL = "/api/tareas";

// Referencias al DOM
const formTarea = document.querySelector("#form-tarea");
const listaTareas = document.querySelector("#lista-tareas");
const sinTareas = document.querySelector("#sin-tareas");
const contadorTotal = document.querySelector("#contador-total");
const contadorCompletadas = document.querySelector("#contador-completadas");
const filtrosContenedor = document.querySelector(".filtros-contenedor");
const errorTitulo = document.querySelector("#error-titulo");
const inputBusqueda = document.querySelector("#input-busqueda");

// Estado de la aplicación
let filtroActual = "todas";

// ===== FUNCIONES PARA CONSUMIR LA API =====

async function obtenerTareas(categoria = "todas") {
  try {
    const busqueda = inputBusqueda.value.trim();
    let query = "";

    if (categoria !== "todas") query += `?categoria=${categoria}`;
    if (busqueda !== "") query += `${query ? "&" : "?"}titulo=${busqueda}`;

    const respuesta = await fetch(`${API_URL}${query}`);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

    const datos = await respuesta.json();
    return datos.datos;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return [];
  }
}

async function crearTarea(tarea) {
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tarea)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.mensaje);
    }

    const datos = await respuesta.json();
    return datos.datos;
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return null;
  }
}

async function toggleTarea(id) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}/toggle`, {
      method: "PATCH"
    });

    if (!respuesta.ok) throw new Error("Error al actualizar");

    const datos = await respuesta.json();
    return datos.datos;
  } catch (error) {
    console.error("Error al alternar tarea:", error);
    return null;
  }
}

async function eliminarTarea(id) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) throw new Error("Error al eliminar");

    return true;
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return false;
  }
}

// ===== RENDERIZADO =====

function crearCardHTML(tarea) {
  const fechaFormateada = new Date(tarea.fechaCreacion)
    .toLocaleDateString("es-MX", { day: "numeric", month: "short" });

  return `
    <article class="tarea-card prioridad-${tarea.prioridad} ${tarea.completada ? "completada" : ""}"
             data-id="${tarea.id}">

      <h3 class="tarea-titulo">${tarea.titulo}</h3>

      ${tarea.descripcion
        ? `<p class="tarea-descripcion">${tarea.descripcion}</p>`
        : ""}

      <div class="tarea-meta">
        <div class="tarea-badges">
          <span class="badge badge-categoria">${tarea.categoria}</span>
          <span class="badge badge-prioridad-${tarea.prioridad}">${tarea.prioridad}</span>
          <span class="badge" style="background:#f1f5f9;color:#475569;">${fechaFormateada}</span>
        </div>
        <div class="tarea-acciones">
          <button class="btn-accion toggle"
                  onclick="manejarToggle(${tarea.id})"
                  title="${tarea.completada ? "Marcar pendiente" : "Completar"}">
            ${tarea.completada ? "↩" : "✓"}
          </button>
          <button class="btn-accion eliminar"
                  onclick="manejarEliminar(${tarea.id})"
                  title="Eliminar">
            ✗
          </button>
        </div>
      </div>
    </article>
  `;
}

async function renderizarTareas() {
  const tareas = await obtenerTareas(filtroActual);

  if (tareas.length === 0) {
    listaTareas.innerHTML = "";
    sinTareas.hidden = false;
  } else {
    sinTareas.hidden = true;
    listaTareas.innerHTML = tareas.map(crearCardHTML).join("");
  }

  // Actualizar contadores
  const todasLasTareas = await obtenerTareas("todas");
  const completadas = todasLasTareas.filter(t => t.completada).length;
  contadorTotal.textContent = `${todasLasTareas.length} tareas`;
  contadorCompletadas.textContent = `${completadas} completadas`;
}

// ===== EVENTOS =====

formTarea.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.querySelector("#titulo").value.trim();
  const descripcion = document.querySelector("#descripcion").value.trim();
  const categoria = document.querySelector("#categoria").value;
  const prioridad = document.querySelector('input[name="prioridad"]:checked').value;

  // Validación
  if (titulo.length < 3) {
    errorTitulo.textContent = "El título debe tener al menos 3 caracteres";
    document.querySelector("#titulo").focus();
    return;
  }

  errorTitulo.textContent = "";

  const nuevaTarea = await crearTarea({ titulo, descripcion, categoria, prioridad });

  if (nuevaTarea) {
    formTarea.reset();
    await renderizarTareas();
  }
});

async function manejarToggle(id) {
  await toggleTarea(id);
  await renderizarTareas();
}

async function manejarEliminar(id) {
  if (confirm("¿Eliminar esta tarea?")) {
    await eliminarTarea(id);
    await renderizarTareas();
  }
}

// ===== FILTROS =====
filtrosContenedor.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn-filtro")) return;

  document.querySelectorAll(".btn-filtro").forEach(btn => {
    btn.classList.remove("activo");
  });

  e.target.classList.add("activo");
  filtroActual = e.target.dataset.filtro;
  renderizarTareas();
});

// ===== BÚSQUEDA =====
inputBusqueda.addEventListener("input", () => {
  renderizarTareas();
});

// ===== INICIO =====
renderizarTareas();