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

//Claves en la tabla
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get('https://api-gestor-claves.up.railway.app/api/claves', { withCredentials: true });

    console.log("Datos recibidos:", response.data);

    const cuerpoTabla = document.querySelector('.table tbody');
    cuerpoTabla.innerHTML = '';

    const claves = Array.isArray(response.data) ? response.data : [response.data];

    claves.forEach((clave, index) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${clave.sitio}</td>
          <td>${clave.nombre_clave}</td>
          <td>${clave.categoria.nombre}</td>
          <td>${clave.usuario}</td>
          <td>••••••••</td>
          <th>
            <button type="button" class="btn" onclick="verClave(this, '${clave.clave}')">
              <i class="lni lni-eye"></i>
            </button>
          </th>
          <td>${clave.compartir === 1 ? '✅ Compartida' : '❌ No compartida'}</td>  
          <td>${clave.id_usuario}</td>
          <th>
            <button type="button" class="btn btn-outline-primary" onclick='abrirModalEditar(${JSON.stringify(clave)})'>Editar</button>
          </th>
        `;
      cuerpoTabla.appendChild(fila);
    });

  } catch (error) {
    console.error("Error completo:", error);
    alert("Error al cargar datos. Ver consola para detalles.");
  }
});

// Función para mostrar la clave real temporalmente
function verClave(boton, clave) {
  const td = boton.closest('tr').children[5]; // La celda con '••••••••'
  const original = td.textContent;
  td.textContent = clave;

  setTimeout(() => {
    td.textContent = original;
  }, 2000); // Oculta la clave después de 2 segundos
}

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
function abrirModalEditar(clave) {
  document.getElementById('editar-id-clave').value = clave.id_clave;
  document.getElementById('editar-sitio').value = clave.sitio;
  document.getElementById('editar-nombre-clave').value = clave.nombre_clave;
  document.getElementById('editar-usuario').value = clave.usuario;
  document.getElementById('editar-clave').value = clave.clave;
  document.getElementById('editar-compartir').value = clave.compartir;

  // Llenar el select de categorías (solo si no lo has llenado antes)
  cargarCategoriasEnSelect('editar-categoria', clave.categoria.id);

  const modal = new bootstrap.Modal(document.getElementById('modalEditarClave'));
  modal.show();
}

//Funcion para cargar las categorias en un select
async function cargarCategoriasEnSelect(idSelect, idCategoriaSeleccionada = null) {
  try {
    const response = await axios.get('https://api-gestor-claves.up.railway.app/api/categorias', { withCredentials: true });
    const categorias = response.data;

    const select = document.getElementById(idSelect);
    select.innerHTML = ''; // Limpiar antes de volver a llenar

    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id_categoria;
      option.textContent = categoria.nombre_categoria;

      if (idCategoriaSeleccionada && categoria.id_categoria === idCategoriaSeleccionada) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando categorías', error);
  }
}
//Editar Clave
document.getElementById('formEditarClave').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editar-id-clave').value;
  const data = {
    sitio: document.getElementById('editar-sitio').value,
    nombre: document.getElementById('editar-nombre-clave').value,
    usuario: document.getElementById('editar-usuario').value,
    clave: document.getElementById('editar-clave').value,
    compartir: parseInt(document.getElementById('editar-compartir').value),
    categoria: parseInt(document.getElementById('editar-categoria').value),

  };

  try {
    await axios.put(`https://api-gestor-claves.up.railway.app/api/claves/${id}`, data, { withCredentials: true });
    alert('Clave actualizada correctamente');
    location.reload(); // Recarga la tabla
  } catch (error) {
    console.error('Error al editar clave:', error);
    alert('Error al guardar los cambios');
  }
});

// Eliminar clave
document.getElementById('btnEliminarClave').addEventListener('click', async function () {
  const id = document.getElementById('editar-id-clave').value;

  if (!id) {
    alert('No se ha seleccionado ninguna clave para eliminar');
    return;
  }

  if (confirm('¿Estás seguro de que deseas eliminar esta clave? Esta acción no se puede deshacer.')) {
    try {
      const response = await axios.delete(`https://api-gestor-claves.up.railway.app/api/claves/${id}`, {
        withCredentials: true
      });

      alert('Clave eliminada correctamente');

      // Cierra el modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarClave'));
      modal.hide();

      // Recarga la tabla
      location.reload();

    } catch (error) {
      console.error('Error al eliminar clave:', error);
      if (error.response && error.response.status === 404) {
        alert('No se encontró la clave o no tienes permiso para eliminarla');
      } else {
        alert('Error al eliminar la clave');
      }
    }
  }
});

// Función para abrir el modal de creación
document.getElementById('fab').addEventListener('click', function () {
  // Cargar categorías en el select
  cargarCategoriasEnSelect('crear-categoria');

  // Resetear el formulario
  document.getElementById('formCrearClave').reset();

  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('modalCrearClave'));
  modal.show();
});

// Manejar el envío del formulario de creación
document.getElementById('formCrearClave').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    sitio: document.getElementById('crear-sitio').value,
    nombre: document.getElementById('crear-nombre-clave').value,
    usuario: document.getElementById('crear-usuario').value,
    clave: document.getElementById('crear-clave').value,
    compartir: parseInt(document.getElementById('crear-compartir').value),
    categoria: parseInt(document.getElementById('crear-categoria').value),
  };

  try {
    const response = await axios.post('https://api-gestor-claves.up.railway.app/api/claves', data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    alert('Clave creada correctamente');

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearClave'));
    modal.hide();

    // Recargar la tabla
    location.reload();

  } catch (error) {
    console.error('Error al crear clave:', error);
    if (error.response && error.response.status === 400) {
      alert('Datos incompletos: ' + error.response.data.message);
    } else {
      alert('Error al crear la clave');
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

// Filtrar por categoria
const cargarSelect = async () => {
  const { data } = await axios.get('https://api-gestor-claves.up.railway.app/api/categorias/', {
    withCredentials: true
  });
  const $select = $('#select-categoria');
  data.map(c => {
    $select.append($('<option>', { value: c.nombre_categoria, text: c.nombre_categoria }))
  });
}

cargarSelect();

$('#select-categoria').on('change', function () {
  let opcion = $(this).val();

  $('#tabla tbody tr').each(function () {
    let categoria = $(this).find('td:eq(2)').text();

    if (opcion === "todos" || categoria === opcion) {
      $(this).show();
    } else {
      $(this).hide();
    }
  })
})