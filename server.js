const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Base de datos en memoria (array de tareas)
let tareas = [
    {
        id: 1,
        titulo: "Aprender HTML5 semántico",
        descripcion: "Estudiar las etiquetas header, nav, main, section, article y footer",
        categoria: "estudio",
        prioridad: "alta",
        completada: false,
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 2,
        titulo: "Practicar CSS Grid",
        descripcion: "Crear layouts con grid-template-columns y grid-template-rows",
        categoria: "practica",
        prioridad: "media",
        completada: true,
        fechaCreacion: new Date().toISOString()
    }
];

let nextId = 3;

// Aquí irán las rutas de la API (Fase 2)
// GET /api/tareas - Obtener todas las tareas
app.get("/api/tareas", (req, res) => {
    // Query param opcional para filtrar por categoría
    const { categoria, titulo } = req.query;
    let resultado = tareas;

    if (categoria && categoria !== "todas") {
        resultado = tareas.filter(t => t.categoria === categoria);
    }

    if (titulo && titulo.trim() !== "") {
        resultado = resultado.filter(t =>
            t.titulo.toLowerCase().includes(titulo.toLowerCase())
        );
    }

    res.json({
        exito: true,
        total: resultado.length,
        datos: resultado
    });
});

// GET /api/tareas/:id - Obtener una tarea específica
app.get("/api/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        return res.status(404).json({ exito: false, mensaje: "Tarea no encontrada" });
    }

    res.json({ exito: true, datos: tarea });
});
// POST /api/tareas - Crear nueva tarea
app.post("/api/tareas", (req, res) => {
    const { titulo, descripcion, categoria, prioridad } = req.body;

    // Validación básica
    if (!titulo || titulo.trim() === "") {
        return res.status(400).json({ exito: false, mensaje: "El título es obligatorio" });
    }

    const nuevaTarea = {
        id: nextId++,
        titulo: titulo.trim(),
        descripcion: descripcion || "",
        categoria: categoria || "general",
        prioridad: prioridad || "media",
        completada: false,
        fechaCreacion: new Date().toISOString()
    };

    tareas.push(nuevaTarea);
    res.status(201).json({ exito: true, datos: nuevaTarea });
});

// PUT /api/tareas/:id - Actualizar tarea
app.put("/api/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const indice = tareas.findIndex(t => t.id === id);

    if (indice === -1) {
        return res.status(404).json({ exito: false, mensaje: "Tarea no encontrada" });
    }

    // Actualizar solo los campos enviados
    tareas[indice] = { ...tareas[indice], ...req.body, id };
    res.json({ exito: true, datos: tareas[indice] });
});

// PATCH /api/tareas/:id/toggle - Alternar completada
app.patch("/api/tareas/:id/toggle", (req, res) => {
    const id = parseInt(req.params.id);
    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        return res.status(404).json({ exito: false, mensaje: "Tarea no encontrada" });
    }

    tarea.completada = !tarea.completada;
    res.json({ exito: true, datos: tarea });
});

// DELETE /api/tareas/:id - Eliminar tarea
app.delete("/api/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const indice = tareas.findIndex(t => t.id === id);

    if (indice === -1) {
        return res.status(404).json({ exito: false, mensaje: "Tarea no encontrada" });
    }

    const eliminada = tareas.splice(indice, 1)[0];
    res.json({ exito: true, datos: eliminada });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor TaskFlow corriendo en http://localhost:${PORT}`);
});
