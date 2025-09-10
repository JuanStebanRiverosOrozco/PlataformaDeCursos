"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plataforma = exports.Curso = void 0;
// Clase Curso
class Curso {
    titulo;
    descripcion;
    profesor;
    estudiantes = []; // correos inscritos
    constructor(titulo, descripcion, profesor // correo del profesor
    ) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.profesor = profesor;
    }
}
exports.Curso = Curso;
// Clase Plataforma genérica
class Plataforma {
    cursos = [];
    usuarios = [];
    // === USUARIOS ===
    agregarUsuario(usuario) {
        const existe = this.usuarios.find((u) => u.correo === usuario.correo);
        if (existe)
            throw new Error("❌ Ya existe un usuario con ese correo.");
        this.usuarios.push(usuario);
    }
    buscarUsuario(nombre, correo) {
        return (this.usuarios.find((u) => u.nombre === nombre && u.correo === correo) || null);
    }
    listarUsuarios() {
        return this.usuarios;
    }
    // === CURSOS ===
    agregarCurso(curso) {
        this.cursos.push(curso);
    }
    listarCursos() {
        return this.cursos;
    }
    inscribirEstudiante(cursoTitulo, correoEstudiante) {
        const curso = this.cursos.find((c) => c.titulo === cursoTitulo);
        if (!curso)
            throw new Error("❌ El curso no existe.");
        if (curso.estudiantes.includes(correoEstudiante)) {
            throw new Error("⚠️ Ya estás inscrito en este curso.");
        }
        curso.estudiantes.push(correoEstudiante);
        // añadir curso al estudiante
        const estudiante = this.usuarios.find((u) => u.correo === correoEstudiante && u.tipo === "estudiante");
        if (estudiante && "cursosInscritos" in estudiante) {
            estudiante.cursosInscritos.push(cursoTitulo);
        }
    }
    obtenerCursosPorProfesor(correoProfesor) {
        return this.cursos.filter((c) => c.profesor === correoProfesor);
    }
    // === Presentación para tablas ===
    // Cursos de profesor listos para tabla
    obtenerCursosProfesor(correoProfesor) {
        return this.obtenerCursosPorProfesor(correoProfesor).map((curso) => {
            return {
                Título: curso.titulo,
                Descripción: curso.descripcion,
            };
        });
    }
    // Estudiantes inscritos en los cursos de un profesor
    obtenerEstudiantesDeCursos(correoProfesor) {
        const cursos = this.obtenerCursosPorProfesor(correoProfesor);
        return cursos.map((curso) => {
            const estudiantes = curso.estudiantes.map((correo) => {
                const est = this.usuarios.find((u) => u.correo === correo);
                return {
                    Nombre: est?.nombre || "Desconocido",
                    Correo: est?.correo || "N/A",
                };
            });
            return {
                curso: curso.titulo,
                estudiantes,
            };
        });
    }
    obtenerCursosEstudiante(correoEstudiante) {
        const estudiante = this.usuarios.find((u) => u.correo === correoEstudiante);
        if (!estudiante || estudiante.tipo !== "estudiante")
            return [];
        return estudiante.cursosInscritos.map((titulo) => {
            const curso = this.cursos.find((c) => c.titulo === titulo);
            const profesor = this.usuarios.find((u) => u.correo === curso?.profesor);
            return {
                Título: curso?.titulo || "Desconocido",
                Descripción: curso?.descripcion || "N/A",
                Profesor: profesor?.nombre || "Desconocido",
                CorreoProfesor: profesor?.correo || "N/A",
            };
        });
    }
}
exports.Plataforma = Plataforma;
//# sourceMappingURL=Plataforma.js.map