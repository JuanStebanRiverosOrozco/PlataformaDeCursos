INFORME 
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

### L — Liskov Substitution

* ❌ **No cumple**
* **Justificación:** Aunque es genérica `<T>`, en realidad solo funciona con `Usuario`. Si se pasa otro tipo, rompe.
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

