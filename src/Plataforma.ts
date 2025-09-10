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
