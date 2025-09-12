INFORME 
# Informe SOLID (S y O) — Proyecto: Plataforma de Cursos

## 1. Contexto
El proyecto implementa una **plataforma de cursos** en Node.js con TypeScript y `@inquirer/prompts`.

Existen tres entidades principales:
- **Usuario** (profesor o estudiante)
- **Curso**
- **Plataforma** (gestiona usuarios y cursos)

El archivo `main.ts` maneja la interacción CLI (menús para login, registro y acciones según rol).

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

#### O (Open/Closed)
- *Diagnóstico:* ⚠️ No cumple del todo  
- *Justificación:* No existe una interfaz/abstracción que permita extender comportamientos del curso (ej. curso en línea, curso presencial).  
- *Refactor propuesto:*

```ts
interface ICurso {
  titulo: string;
  descripcion: string;
  profesor: string;
  estudiantes: string[];
}

class CursoOnline implements ICurso { /* ... */ }
class CursoPresencial implements ICurso { /* ... */ }
```
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