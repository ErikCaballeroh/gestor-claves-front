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
      window.location.href = '/index.html';
    }, 1000);
  });

//Categorias en la tabla
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get('https://api-gestor-claves.up.railway.app/api/categorias', { withCredentials: true });

    console.log("Datos recibidos:", response.data);

    const cuerpoTabla = document.querySelector('.table tbody');
    cuerpoTabla.innerHTML = '';

    const claves = Array.isArray(response.data) ? response.data : [response.data];

    claves.forEach((categorias, index) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${categorias.nombre_categoria}</td>
          <th>
            <button type="button" class="btn btn-outline-primary" onclick='abrirModalEditar(${JSON.stringify(categorias)})'>Editar</button>
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
function abrirModalEditar(categorias) {
  document.getElementById('editar-id-categoria').value = categorias.id_categoria;
  document.getElementById('editar-nombre-categoria').value = categorias.nombre_categoria;

  const modal = new bootstrap.Modal(document.getElementById('modalEditarCategorias'));
  modal.show();
}
//Editar Categorias
document.getElementById('formEditarCategorias').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editar-id-categoria').value;
  const data = {
    nombre: document.getElementById('editar-nombre-categoria').value,

  };

  try {
    await axios.put(`https://api-gestor-claves.up.railway.app/api/categorias/${id}`, data, { withCredentials: true });
    alert('Categoria actualizada correctamente');
    location.reload(); // Recarga la tabla
  } catch (error) {
    console.error('Error al editar la categoria:', error);
    alert('Error al guardar los cambios');
  }
});

// Eliminar usuario
document.getElementById('btnEliminarCategoria').addEventListener('click', async function () {
  const id = document.getElementById('editar-id-categoria').value;

  if (!id) {
    alert('No se ha seleccionado ninguna categoria para eliminar');
    return;
  }

  if (confirm('¿Estás seguro de que deseas eliminar esta categoria? Esta acción no se puede deshacer.')) {
    try {
      const response = await axios.delete(`https://api-gestor-claves.up.railway.app/api/categorias/${id}`, {
        withCredentials: true
      });

      alert('Categoria eliminada correctamente');

      // Cierra el modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarCategorias'));
      modal.hide();

      // Recarga la tabla
      location.reload();

    } catch (error) {
      console.error('Error al eliminar la categoria:', error);
      if (error.response && error.response.status === 404) {
        alert('No se encontró la categoria o no tienes permiso para eliminarla');
      } else {
        alert('Error al eliminar la categoria');
      }
    }
  }
});

// Función para abrir el modal de creación
document.getElementById('fab').addEventListener('click', function () {

  // Resetear el formulario
  document.getElementById('formCrearCategoria').reset();

  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('modalCrearCategoria'));
  modal.show();
});

// Manejar el envío del formulario de creación
document.getElementById('formCrearCategoria').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById('crear-nombre-categoria').value,
  };

  try {
    const response = await axios.post('https://api-gestor-claves.up.railway.app/api/categorias', data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    alert('Categoria creada correctamente');

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearCategoria'));
    modal.hide();

    // Recargar la tabla
    location.reload();

  } catch (error) {
    console.error('Error al crear la categoria:', error);
    if (error.response && error.response.status === 400) {
      alert('Datos incompletos: ' + error.response.data.message);
    } else {
      alert('Error al crear la categoria');
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
      window.location.href = '/index.html';
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
