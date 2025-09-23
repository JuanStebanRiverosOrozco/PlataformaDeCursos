ccINFORME 
# Informe SOLID  — Proyecto: Plataforma de Cursos

## 1. Contexto
El proyecto implementa una **plataforma de cursos** en Node.js con TypeScript y `@inquirer/prompts`.

Existen tres entidades principales:
- **Usuario** (profesor o estudiante)
- **Curso**
- **Plataforma** (gestiona usuarios y cursos)

El archivo `index.ts` maneja la interacción CLI (menús para login, registro y acciones según rol).

---

## 2. Inventario de Clases Analizadas
- **Clase `Curso`** — Representa un curso con título, descripción, profesor y lista de estudiantes.  
- **Clase `Plataforma<T>`** — Contenedor que gestiona usuarios y cursos.  
- **Tipos `Usuario`, `Estudiante`, `Profesor`** — Modelan roles del sistema (no son clases, pero relevantes para el diseño).  

---
## 3. Análisis por Clase

### 3.1 Clase Curso

#### S (Single Responsibility)
- *Responsabilidad declarada:* Representar un curso y su relación con profesor/estudiantes.  
- *Diagnóstico:* ✅ Cumple  
- *Justificación:* Solo modela datos del curso (atributos y lista de estudiantes).  
- *Riesgo si se mantiene así:* Bajo, ya que cambios en reglas de negocio (inscripción, validación) no afectan esta clase.  

---

### O — Open/Closed

* ⚠️ *No cumple del todo*
* *Justificación:* Si se quiere extender a distintos tipos de curso (online, presencial), hay que modificar la clase existente.
* *Ejemplo de solución:*

### sugerencia de mejora

```ts
interface ICurso {
  titulo: string;
  descripcion: string;
  profesor: string;
  estudiantes: string[];
  inscribir(correo: string): void;
}

class CursoOnline implements ICurso {
  estudiantes: string[] = [];
  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string,
    public linkZoom: string
  ) {}
  inscribir(correo: string) { this.estudiantes.push(correo); }
}

class CursoPresencial implements ICurso {
  estudiantes: string[] = [];
  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string,
    public salon: string
  ) {}
  inscribir(correo: string) { this.estudiantes.push(correo); }
}
```
---
### codigo anterior
---
```ts
// Clase Curso
export class Curso {
  public estudiantes: string[] = []; // correos inscritos

  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string // correo del profesor
  ) {}
}
```

✅ Ahora está abierto a extensión (nuevos tipos de curso) y cerrado a modificación.

---

### L — Liskov Substitution

* ✅ *Cumple actualmente*
* *Justificación:* No tiene subclases aún.
* *Ejemplo futuro con subclases válidas:*

### sugerencia de mejora
```ts
function inscribirEnCurso(curso: ICurso, correo: string) {
  curso.inscribir(correo); // funciona con CursoOnline y CursoPresencial
}
```
---
### codigo anterior
---
```ts
// Clase Curso
export class Curso {
  public estudiantes: string[] = []; // correos inscritos

  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string // correo del profesor
  ) {}
}

```

✅ Cualquier ICurso puede sustituir a otro sin romper el sistema.

---

### I — Interface Segregation

* ✅ *Cumple indirectamente*
* *Justificación:* La interfaz ICurso es mínima (datos + inscribir).
* *Ejemplo:*

### sugerencia de mejora

```ts
function mostrarDatosCurso(curso: ICurso) {
  console.log(`${curso.titulo} - ${curso.descripcion}`);
}
```
---
### codigo anterior
---
```ts
// Clase Curso
export class Curso {
  public estudiantes: string[] = []; // correos inscritos

  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string // correo del profesor
  ) {}
}
```

✅ Ningún consumidor depende de métodos que no necesita.

---

### D — Dependency Inversion

* ❌ *No cumple*
* *Justificación:* El código depende directamente de Curso.
* *Ejemplo de solución:* trabajar contra la interfaz ICurso.

### sugerencia de mejora

```ts
function imprimirCurso(curso: ICurso) {
  console.log(`Curso: ${curso.titulo}, Profesor: ${curso.profesor}`);
}
```
---
### codigo anterior
---
```ts
export class Curso {
  public estudiantes: string[] = []; // correos inscritos

  constructor(
    public titulo: string,
    public descripcion: string,
    public profesor: string // correo del profesor
  ) {}
}
```

✅ Así se puede cambiar la implementación (online, presencial) sin afectar al resto del sistema.

---

###  Conclusión Clase Curso

* *Cumple:* S, L, I.
* *No cumple:* O, D.
* *Refactor necesario:* Introducir ICurso y usarlo como contrato.

---


### 3.2 Clase Plataforma<T>
#### S (Single Responsibility)

Responsabilidad declarada: Gestionar usuarios y cursos (registro, inscripción, consultas).

Diagnóstico: ❌ No cumple

Justificación: Tiene varias razones de cambio:

Gestión de usuarios (agregarUsuario, buscarUsuario)

Gestión de cursos (agregarCurso, inscribirEstudiante)

Presentación de datos (obtenerCursosProfesor, obtenerEstudiantesDeCursos)

Riesgo: Alta cohesión forzada → acoplamiento; pruebas frágiles si cambian usuarios o cursos.

Refactor propuesto (separar responsabilidades):
### sugerencia de mejora
```ts
class UsuarioService {
  private usuarios: Usuario[] = [];
  agregar(usuario: Usuario) { /* ... */ }
  buscar(nombre: string, correo: string): Usuario | null { /* ... */ }
  listar(): Usuario[] { return this.usuarios; }
}

class CursoService {
  private cursos: Curso[] = [];
  agregar(curso: Curso) { /* ... */ }
  listar(): Curso[] { return this.cursos; }
  inscribir(estudiante: Usuario, curso: Curso) { /* ... */ }
}

class ReporteService {
  cursosDeProfesor(cursos: Curso[], profesorCorreo: string): any[] { /* ... */ }
  estudiantesPorCurso(cursos: Curso[], usuarios: Usuario[]): any[] { /* ... */ }
}
```
---

### codigo anterior

---

```ts
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
```

✅ Ahora cada clase tiene una sola responsabilidad.
---

### O — Open/Closed

* ❌ *No cumple*
* *Justificación:* Cualquier nueva funcionalidad (reportes, filtros, etc.) requiere modificar la clase.
* *Ejemplo de solución:* abrir a extensión vía interfaces/servicios.

### sugerencia de mejora

```ts
interface IUsuarioService {
  agregar(usuario: Usuario): void;
  buscar(correo: string): Usuario | null;
}

interface ICursoService {
  agregar(curso: ICurso): void;
  inscribir(estudiante: Usuario, curso: ICurso): void;
}

```
---

### codigo anterior

---

```ts
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

  // === CURSOS ===
  agregarCurso(curso: Curso) {
    this.cursos.push(curso);
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
}
```

✅ Ahora se pueden crear nuevas implementaciones de servicios sin modificar la clase principal.

---

### L — Liskov Substitution

* ❌ **No cumple**
* **Justificación:** Aunque es genérica `<T>`, en realidad solo funciona con `Usuario`. Si se pasa otro tipo, rompe.
* **Codigo anterior:**
```ts
// Clase Plataforma genérica
export class Plataforma<T> {
  private cursos: Curso[] = [];
  private usuarios: T[] = [];
  }
```
* **Ejemplo de solución:**
```ts
export class Plataforma<T extends Usuario> {
  private usuarios: T[] = [];
  private cursos: ICurso[] = [];
}
```

✅ Ahora se garantiza que siempre será un `Usuario` o subtipos.

---

### I — Interface Segregation

* ❌ **No cumple**
* **Justificación:** Todos los métodos están en la misma clase, aunque no todos los consumidores los necesiten.
* **Ejemplo de solución:** separar interfaces pequeñas.
* **en este caso no se muestra el codigo anterior por lo que no existe una sección de interfaces:**
```ts
interface IReporteService {
  cursosDeProfesor(correoProfesor: string): any[];
  estudiantesPorCurso(correoProfesor: string): any[];
}
```

✅ Profesores solo dependen de reportes, estudiantes solo de inscripciones.

---

#### D —  Dependency Inversion Principle (DIP)

* ❌ *No cumple*
* *Justificación:* Depende de arrays internos (Usuario[], Curso[]).
* *Ejemplo de solución:* usar repositorios inyectados.


### sugerencia de mejora
```ts
interface IRepositorioUsuarios {
  agregar(usuario: Usuario): void;
  buscar(correo: string): Usuario | null;
  listar(): Usuario[];
}

interface IRepositorioCursos {
  agregar(curso: ICurso): void;
  buscar(titulo: string): ICurso | null;
  listar(): ICurso[];
}

class Plataforma {
  constructor(
    private repoUsuarios: IRepositorioUsuarios,
    private repoCursos: IRepositorioCursos
  ) {}

  inscribirEstudiante(cursoTitulo: string, correoEstudiante: string) {
    const curso = this.repoCursos.buscar(cursoTitulo);
    const estudiante = this.repoUsuarios.buscar(correoEstudiante);
    if (curso && estudiante) curso.inscribir(estudiante.correo);
  }
}

```
---
### codigo anterior
---
```ts
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

```

✅ Ahora la lógica funciona con cualquier repositorio (memoria, BD, API externa).

---

### 📌 Conclusión Clase Plataforma<T>

* *Cumple:* Ninguno.
* *No cumple:* S, O, L, I, D.
* *Refactor necesario:* dividir en servicios, restringir el genérico, crear interfaces específicas e invertir dependencias mediante repositorios.

---

## 4. Conclusiones Generales

* *Clase Curso*: bien diseñada en SRP, LSP e ISP; requiere mejoras en OCP y DIP.
* *Clase Plataforma<T>*: concentra demasiada lógica, incumple todos los principios SOLID.

