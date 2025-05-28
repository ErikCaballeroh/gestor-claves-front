const form = document.getElementById('login-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('https://api-gestor-claves.up.railway.app/api/auth/login', {
            email: username, // Asegúrate de que coincidan los campos con tu backend
            password: password,
        }, {
            withCredentials: true // 👈 Esto permite enviar cookies de sesión
        });

        if (response.status === 200) {
            alert('Inicio de sesión exitoso');
            console.log('Usuario logueado:', response.data.user);
            window.location.href = 'dashboard.html'; // 👈 Redirige al dashboard
        }
    } catch (error) {
        if (error.response) {
            alert(error.response.data.message || 'Error al iniciar sesión');
        } else {
            console.error(error.message);
            alert('No se pudo conectar al servidor.');
        }
    }
});

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');


registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});


$(document).ready(function () {
    $('#form-registro').submit(async function (e) {
        e.preventDefault();
        const usuario = $('#usuario').val();
        const correo = $('#correo').val();
        const contrasena = $('#contrasena').val();

        const datos = {
            nombre: usuario,
            email: correo,
            clave: contrasena,
        }

        try {
            const respuesta = await axios.post('https://api-gestor-claves.up.railway.app/api/auth/register', datos, {
                withCredentials: true
            });
            if (respuesta.status === 201) {
                Swal.fire({
                    title: "Registro exitoso!",
                    text: respuesta.data.message,
                    icon: "success",
                });
            }
        } catch (err) {
            console.log(datos, err);

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response.data.message,
            });
        }
    })

    $('#olvidar').click(async function () {
        try {
            // Primero pedir el correo electrónico
            const { value: correo } = await Swal.fire({
                title: 'Recuperar contraseña',
                input: 'email',
                inputLabel: 'Por favor ingresa tu correo electrónico',
                inputPlaceholder: 'tu@correo.com',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Debes ingresar un correo electrónico';
                    }
                    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                        return 'Ingresa un correo electrónico válido';
                    }
                }
            });

            // Si el usuario canceló o no ingresó correo
            if (!correo) return;

            // Obtener los datos de la sesión del usuario
            const response = await axios.get(`https://api-gestor-claves.up.railway.app/api/auth/usuario/${correo}`);
            const userData = response.data;

            // Mostrar la alerta de confirmación para WhatsApp
            const result = await Swal.fire({
                title: '¿Olvidaste tu contraseña?',
                text: 'Se abrirá WhatsApp para enviar una solicitud al administrador.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, abrir WhatsApp',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            });

            // Si el usuario confirma
            if (result.isConfirmed) {
                // Crear el mensaje para WhatsApp
                const mensaje = `Hola soporte, olvidé mi contraseña. Mis datos son:\n\n` +
                    `*ID:* ${userData.id_usuario}\n` +
                    `*Nombre:* ${userData.nombre}\n` +
                    `*Email:* ${userData.email}\n\n` +
                    `Por favor, solicito que se envie la contraseña a mi correo.`;

                // Codificar el mensaje para URL
                const mensajeCodificado = encodeURIComponent(mensaje);

                // Número de soporte (reemplaza con el número real)
                const numeroSoporte = "+5218126335401"; // Ejemplo: +51987654321

                // Abrir WhatsApp con el mensaje
                window.open(`https://wa.me/${numeroSoporte}?text=${mensajeCodificado}`, '_blank');

                // Opcional: Mostrar confirmación
                Swal.fire(
                    'WhatsApp abierto',
                    'Por favor envía el mensaje al administrador.',
                    'info'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire(
                'Error',
                'No se pudieron obtener los datos de tu cuenta. Por favor, verifica tu correo e inténtalo de nuevo.',
                'error'
            );
        }
    });
});
