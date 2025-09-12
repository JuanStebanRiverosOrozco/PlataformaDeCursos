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