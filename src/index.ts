import { input, select } from "@inquirer/prompts";
import { Plataforma, Curso, Usuario } from "./plataforma";

async function main() {
  const plataforma = new Plataforma<Usuario>();
  let usuarioActual: Usuario | null = null;

  while (true) {
    const opcion = await select({
      message: "📚 Plataforma de Cursos",
      choices: [
        { name: "🔑 Acceder", value: "acceder" },
        { name: "📝 Crear usuario", value: "crear" },
        { name: "🚪 Salir", value: "salir" },
      ],
    });

    // === LOGIN ===
    if (opcion === "acceder") {
      const nombre = await input({ message: "Ingrese su nombre:" });
      const correo = await input({ message: "Ingrese su correo:" });

      usuarioActual = plataforma.buscarUsuario(nombre, correo);
      if (!usuarioActual) {
        console.log("❌ Usuario no encontrado.");
        continue;
      }
      console.log(`✅ Bienvenido de nuevo, ${usuarioActual.nombre}!`);

      // === MENÚ PROFESOR ===
      if (usuarioActual.tipo === "profesor") {
        while (true) {
          const opcionProfesor = await select({
            message: "👨‍🏫 Menú Profesor",
            choices: [
              { name: "📚 Crear curso", value: "crear_curso" },
              { name: "📘 Mostrar mis cursos", value: "mis_cursos" },
              { name: "🧑‍🎓 Ver alumnos inscritos", value: "ver_alumnos" },
              { name: "🚪 Cerrar sesión", value: "exit" },
            ],
          });

          if (opcionProfesor === "crear_curso") {
            const titulo = await input({ message: "Título del curso:" });
            const descripcion = await input({
              message: "Descripción del curso:",
            });
            plataforma.agregarCurso(
              new Curso(titulo, descripcion, usuarioActual.correo)
            );
            console.log("✅ Curso creado con éxito!");
          } else if (opcionProfesor === "mis_cursos") {
            const tablaCursos =
              plataforma.obtenerCursosProfesor(usuarioActual.correo);
            console.table(tablaCursos);
          } else if (opcionProfesor === "ver_alumnos") {
            const cursosConEstudiantes =
              plataforma.obtenerEstudiantesDeCursos(usuarioActual.correo);
            cursosConEstudiantes.forEach((c) => {
              console.log(`📖 ${c.curso} - Estudiantes inscritos:`);
              if (c.estudiantes.length > 0) {
                console.table(c.estudiantes);
              } else {
                console.log("⚠️ No hay estudiantes inscritos.");
              }
            });
          } else if (opcionProfesor === "exit") {
            usuarioActual = null;
            break;
          }
        }
      }

      // === MENÚ ESTUDIANTE ===
      if (usuarioActual?.tipo === "estudiante") {
        while (true) {
          const opcionEstudiante = await select({
            message: "🧑‍🎓 Menú Estudiante",
            choices: [
              { name: "📘 Ver mis cursos inscritos", value: "mis_cursos" },
              {
                name: "📖 Ver cursos disponibles e inscribirme",
                value: "cursos_disponibles",
              },
              { name: "🚪 Cerrar sesión", value: "exit" },
            ],
          });

          if (opcionEstudiante === "mis_cursos") {
            const cursos =
              plataforma.obtenerCursosEstudiante(usuarioActual.correo);
            console.table(cursos);
          } else if (opcionEstudiante === "cursos_disponibles") {
            const cursos = plataforma.listarCursos();
            if (cursos.length === 0) {
              console.log("⚠️ No hay cursos disponibles aún.");
              continue;
            }

            console.log(
              "📖 Cursos disponibles:",
              cursos.map((c) => c.titulo)
            );

            const cursoTitulo = await input({
              message: "Ingrese el título del curso al que desea inscribirse:",
            });
            try {
              plataforma.inscribirEstudiante(cursoTitulo, usuarioActual.correo);
              console.log("✅ Inscripción realizada!");
            } catch (err: any) {
              console.log(err.message);
            }
          } else if (opcionEstudiante === "exit") {
            usuarioActual = null;
            break;
          }
        }
      }
    }

    // === REGISTRO ===
    else if (opcion === "crear") {
      const nombre = await input({ message: "Ingrese su nombre:" });
      const correo = await input({ message: "Ingrese su correo:" });
      const tipo = await select({
        message: "Seleccione su tipo de usuario:",
        choices: [
          { name: "Estudiante", value: "estudiante" },
          { name: "Profesor", value: "profesor" },
        ],
      });

      let usuario: Usuario;
      if (tipo === "estudiante") {
        usuario = { nombre, correo, tipo: "estudiante", cursosInscritos: [] };
      } else {
        usuario = { nombre, correo, tipo: "profesor", cursosDictados: [] };
      }

      try {
        plataforma.agregarUsuario(usuario);
        console.log("✅ Usuario creado con éxito!");
      } catch (err: any) {
        console.log(err.message);
      }
    }

    // === SALIR ===
    else if (opcion === "salir") {
      console.log("👋 ¡Hasta luego!");
      break;
    }
  }
}

main();
