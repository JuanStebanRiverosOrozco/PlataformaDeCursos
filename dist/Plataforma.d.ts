export type Persona = {
    nombre: string;
    correo: string;
};
export type Estudiante = {
    tipo: "estudiante";
    cursosInscritos: string[];
};
export type Profesor = {
    tipo: "profesor";
    cursosDictados: string[];
};
export type Usuario = Persona & (Estudiante | Profesor);
export declare class Curso {
    titulo: string;
    descripcion: string;
    profesor: string;
    estudiantes: string[];
    constructor(titulo: string, descripcion: string, profesor: string);
}
export declare class Plataforma<T> {
    private cursos;
    private usuarios;
    agregarUsuario(usuario: T): void;
    buscarUsuario(nombre: string, correo: string): T | null;
    listarUsuarios(): T[];
    agregarCurso(curso: Curso): void;
    listarCursos(): Curso[];
    inscribirEstudiante(cursoTitulo: string, correoEstudiante: string): void;
    obtenerCursosPorProfesor(correoProfesor: string): Curso[];
    obtenerCursosProfesor(correoProfesor: string): {
        Título: string;
        Descripción: string;
    }[];
    obtenerEstudiantesDeCursos(correoProfesor: string): {
        curso: string;
        estudiantes: {
            Nombre: string;
            Correo: string;
        }[];
    }[];
    obtenerCursosEstudiante(correoEstudiante: string): {
        Título: string;
        Descripción: string;
        Profesor: string;
        CorreoProfesor: string;
    }[];
}
//# sourceMappingURL=Plataforma.d.ts.map