document.addEventListener("DOMContentLoaded", function () {
  // Configurar el logout
  setupLogout(); // Usa el ID por defecto 'logout'
});
//Barra lateral
const hamBurger = document.querySelector(".toggle-btn");

hamBurger.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");
});

//VERIFICAR SESION
// Verifica la sesión cuando se carga el dashboard
axios.get('https://api-gestor-claves.up.railway.app/api/auth/session', {
  withCredentials: true
})
  .then(response => {
    console.log('Sesión activa', response.data.session);

  })
  .catch(error => {
    alert('No tienes una sesión activa. Porfavor inicia sesión o registrate.');

    // Redirigir después de 2 segundos (2000 milisegundos)
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  });

//Usuarios en la tabla
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get('https://api-gestor-claves.up.railway.app/api/usuarios', { withCredentials: true });

    console.log("Datos recibidos:", response.data);

    const cuerpoTabla = document.querySelector('.table tbody');
    cuerpoTabla.innerHTML = '';

    const claves = Array.isArray(response.data) ? response.data : [response.data];

    claves.forEach((usuarios, index) => {
      console.log(usuarios);

      const fila = document.createElement('tr');
      fila.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${usuarios.nombre}</td>
          <td>${usuarios.email}</td>
          <td>${usuarios.clave}</td>
          <td>${usuarios.rol.nombre}</td>
          <td>${usuarios.familia.nombre}</td>
          <th>
            <button type="button" class="btn btn-outline-primary" onclick='abrirModalEditar(${JSON.stringify(usuarios)})'>Editar</button>
          </th>
        `;
      cuerpoTabla.appendChild(fila);
    });

  } catch (error) {
    console.error("Error completo:", error);
    alert("Error al cargar datos. Ver consola para detalles.");
  }
});


//Bienvenida
// Función para obtener datos del usuario 
obtenerUsuario();

//Busqueda
const inputBuscador = document.getElementById('buscador');
const cuerpoTabla = document.querySelector('.table tbody');


inputBuscador.addEventListener('input', () => {
  const filtro = inputBuscador.value.toLowerCase();
  const filas = cuerpoTabla.getElementsByTagName('tr');

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    const textoFila = fila.textContent.toLowerCase();

    if (textoFila.includes(filtro)) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  }
});
///Modal
function abrirModalEditar(usuario) {
  document.getElementById('editar-id-usuario').value = usuario.id_usuario;
  document.getElementById('editar-nombre-usuario').value = usuario.nombre;
  document.getElementById('editar-email-usuario').value = usuario.email;
  document.getElementById('editar-clave-usuario').value = usuario.clave;
  document.getElementById('editar-rol-usuario').value = usuario.rol.id;
  document.getElementById('editar-familia-usuario').value = usuario.familia.id;

  const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuarios'));
  modal.show();
}
//Editar Usuario
document.getElementById('formEditarUsuarios').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editar-id-usuario').value;
  const data = {
    nombre: document.getElementById('editar-nombre-usuario').value,
    email: document.getElementById('editar-email-usuario').value,
    clave: document.getElementById('editar-clave-usuario').value,
    id_rol: parseInt(document.getElementById('editar-rol-usuario').value),
    id_familia: parseInt(document.getElementById('editar-familia-usuario').value),

  };

  try {
    await axios.put(`https://api-gestor-claves.up.railway.app/api/usuarios/${id}`, data, { withCredentials: true });
    alert('Usuario actualizado correctamente');
    location.reload(); // Recarga la tabla
  } catch (error) {
    console.error('Error al editar el usuario:', error);
    alert('Error al guardar los cambios');
  }
});

// Eliminar usuario
document.getElementById('btnEliminarUsuario').addEventListener('click', async function () {
  const id = document.getElementById('editar-id-usuario').value;

  if (!id) {
    alert('No se ha seleccionado ninguna usuario para eliminar');
    return;
  }

  if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
    try {
      const response = await axios.delete(`https://api-gestor-claves.up.railway.app/api/usuarios/${id}`, {
        withCredentials: true
      });

      alert('Usuario eliminado correctamente');

      // Cierra el modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuarios'));
      modal.hide();

      // Recarga la tabla
      location.reload();

    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      if (error.response && error.response.status === 404) {
        alert('No se encontró el usuario o no tienes permiso para eliminarla');
      } else {
        alert('Error al eliminar el usuario');
      }
    }
  }
});

async function obtenerUsuario() {
  try {
    const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/auth/session', {
      withCredentials: true
    });

    const nombreUsuario = respuesta.data?.session?.nombre || "Invitado";
    const elementoBienvenida = document.getElementById("bienvenida");

    // Respetar el texto original y solo agregar el nombre
    const textoOriginal = elementoBienvenida.textContent.trim();
    const textoBase = textoOriginal.replace(/: $/, "") || "Cuenta de"; // Elimina ": " si existe

    elementoBienvenida.textContent = `${textoBase} ${nombreUsuario}`;

  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    const elementoBienvenida = document.getElementById("bienvenida");
    const textoOriginal = elementoBienvenida.textContent.trim();
    const textoBase = textoOriginal.replace(/: $/, "") || "Cuenta de";

    elementoBienvenida.textContent = `${textoBase}: Invitado`;
  }
}

async function logout() {
  try {
    const response = await axios.post('https://api-gestor-claves.up.railway.app/api/auth/logout', {}, {
      withCredentials: true
    });

    if (response.status === 200) {
      // Limpiar almacenamiento local
      localStorage.clear();
      sessionStorage.clear();

      // Redirigir al login
      window.location.href = '../index.html';
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error; // Permite manejar el error en el componente que llama la función
  }
}

function setupLogout(elementId = 'logout') {
  const logoutElement = document.getElementById(elementId);
  if (logoutElement) {
    logoutElement.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await logout();
      } catch (error) {
        alert('Ocurrió un error al cerrar sesión. Por favor intente nuevamente.');
      }
    });
  }
}
