export type Persona = {
  nombre: string;
  correo: string;
};

// Estudiante
export type Estudiante = {
  tipo: "estudiante";
  cursosInscritos: string[];
};

// Profesor
export type Profesor = {
  tipo: "profesor";
  cursosDictados: string[];
};

// Usuario = Persona con rol
export type Usuario = Persona & (Estudiante | Profesor);

// Clase Curso
export class Curso {
  public estudiantes: string[] = []; // correos inscritos

  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string // correo del profesor
  ) {}
}


// Clase Plataforma genérica
export class Plataforma<T> {
  private cursos: Curso[] = [];
  private usuarios: T[] = [];

  // === USUARIOS ===
  agregarUsuario(usuario: T) {
    const existe = (this.usuarios as any).find(
      (u: Usuario) => u.correo === (usuario as any).correo
    );
    if (existe) throw new Error("❌ Ya existe un usuario con ese correo.");
    this.usuarios.push(usuario);
  }

  buscarUsuario(nombre: string, correo: string): T | null {
    return (
      (this.usuarios as any).find(
        (u: Usuario) => u.nombre === nombre && u.correo === correo
      ) || null
    );
  }

  listarUsuarios(): T[] {
    return this.usuarios;
  }

  // === CURSOS ===
  agregarCurso(curso: Curso) {
    this.cursos.push(curso);
  }

  listarCursos(): Curso[] {
    return this.cursos;
  }

  inscribirEstudiante(cursoTitulo: string, correoEstudiante: string) {
    const curso = this.cursos.find((c) => c.titulo === cursoTitulo);
    if (!curso) throw new Error("❌ El curso no existe.");
    if (curso.estudiantes.includes(correoEstudiante)) {
      throw new Error("⚠️ Ya estás inscrito en este curso.");
    }
    curso.estudiantes.push(correoEstudiante);

    // añadir curso al estudiante
    const estudiante = (this.usuarios as any).find(
      (u: Usuario) => u.correo === correoEstudiante && u.tipo === "estudiante"
    ) as Usuario | undefined;

    if (estudiante && "cursosInscritos" in estudiante) {
      estudiante.cursosInscritos.push(cursoTitulo);
    }
  }

  obtenerCursosPorProfesor(correoProfesor: string): Curso[] {
    return this.cursos.filter((c) => c.profesor === correoProfesor);
  }

  // === Presentación para tablas ===

  // Cursos de profesor listos para tabla
  obtenerCursosProfesor(correoProfesor: string) {
    return this.obtenerCursosPorProfesor(correoProfesor).map((curso) => {
      return {
        Título: curso.titulo,
        Descripción: curso.descripcion,
      };
    });
  }

  // Estudiantes inscritos en los cursos de un profesor
  obtenerEstudiantesDeCursos(correoProfesor: string) {
    const cursos = this.obtenerCursosPorProfesor(correoProfesor);

    return cursos.map((curso) => {
      const estudiantes = curso.estudiantes.map((correo) => {
        const est = this.usuarios.find(
          (u: any) => u.correo === correo
        ) as Usuario;

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

  obtenerCursosEstudiante(correoEstudiante: string) {
    const estudiante = this.usuarios.find(
      (u: any) => u.correo === correoEstudiante
    ) as Usuario;

    if (!estudiante || estudiante.tipo !== "estudiante") return [];

    return estudiante.cursosInscritos.map((titulo) => {
      const curso = this.cursos.find((c) => c.titulo === titulo);
      const profesor = this.usuarios.find(
        (u: any) => u.correo === curso?.profesor
      ) as Usuario;

      return {
        Título: curso?.titulo || "Desconocido",
        Descripción: curso?.descripcion || "N/A",
        Profesor: profesor?.nombre || "Desconocido",
        CorreoProfesor: profesor?.correo || "N/A",
      };
    });
  }
}
