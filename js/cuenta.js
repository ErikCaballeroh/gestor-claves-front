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

//Bienvenida
// Función para obtener datos del usuario y actualizar el mensaje de bienvenida
async function obtenerUsuario() {
  try {
    const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/auth/session', { withCredentials: true });
    const nombreUsuario = respuesta.data?.session?.nombre || "Invitado";
    const elementoBienvenida = document.getElementById("bienvenida");
    if (elementoBienvenida) {
      const textoOriginal = elementoBienvenida.textContent.trim();
      const textoBase = textoOriginal.replace(/: $/, "") || "Cuenta de";
      elementoBienvenida.textContent = `${textoBase}: ${nombreUsuario}`;
    }
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    const elementoBienvenida = document.getElementById("bienvenida");
    if (elementoBienvenida) {
      const textoOriginal = elementoBienvenida.textContent.trim();
      const textoBase = textoOriginal.replace(/: $/, "") || "Cuenta de";
      elementoBienvenida.textContent = `${textoBase}: Invitado`;
    }
  }
}

// Llama a la función cuando se carga la página
obtenerUsuario();

// Función para obtener y mostrar datos del usuario
async function mostrarDatosUsuario() {
  try {
    // Obtener datos de sesión
    const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/auth/session', {
      withCredentials: true
    });


    const datosUsuario = respuesta.data.session;

    // Crear HTML para mostrar la información
    let htmlInfo = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Información de la Cuenta</h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Nombre:</strong> ${datosUsuario.nombre || "No disponible"}</li>
            <li class="list-group-item"><strong>Email:</strong> ${datosUsuario.email || "No disponible"}</li>
            <li class="list-group-item"><strong>Rol:</strong> ${datosUsuario.rol.nombre || "Usuario"}</li>
            <li class="list-group-item"><strong>Familia a la que pertenece:</strong> ${datosUsuario.familia?.nombre || "Sin familia"}</li>
    `;

    htmlInfo += `
          </ul>
        </div>
      </div>
    `;

    // Insertar en el DOM
    document.querySelector(".main .text-justify").innerHTML += htmlInfo;

    // Agregar event listeners para los botones
    document.getElementById("btnCambiarClave")?.addEventListener("click", () => {
      // Lógica para cambiar contraseña
      alert("Funcionalidad para cambiar contraseña en desarrollo");
    });

  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    document.querySelector(".main .text-justify").innerHTML += `
      <div class="alert alert-danger">
        No se pudieron cargar los datos de la cuenta. Intenta recargar la página.
      </div>
    `;
  }
}
// Llamar a la función cuando se carga la página
document.addEventListener("DOMContentLoaded", mostrarDatosUsuario);

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
