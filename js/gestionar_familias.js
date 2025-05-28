$(document).ready(function () {
    const getMiembros = async () => {
        try {
            const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/familias/miembros', {
                withCredentials: true
            });

            const miembros = respuesta.data;
            console.log(miembros);

            miembros.map(m => {
                $('#tbody').append(`
                  <tr>
                      <td>${m.nombre}</td>
                      <td>${m.email}</td>
                      <td>
                        <button class="btn btn-danger btn-expulsar" data-id-usuario="${m.id_usuario}">Expulsar</button>
                      </td>
                  </tr>
              `);
            });

            // Aquí llamamos a expulsarMiembro después de pintar los botones
            expulsarMiembro();

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response?.data?.message || "Error al cargar miembros",
            });
        }
    }

    const crearInvitacion = () => {
        $('#crear-invitacion').click(async function () {
            const confirmacion = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta invitación tendrá una duración de 3 días.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, crear',
                cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                try {
                    // Crear fecha de vencimiento (3 días después de ahora)
                    const fechaVencimiento = new Date();
                    fechaVencimiento.setDate(fechaVencimiento.getDate() + 3);

                    // Formatear la fecha como YYYY-MM-DD
                    const year = fechaVencimiento.getFullYear();
                    const month = String(fechaVencimiento.getMonth() + 1).padStart(2, '0');
                    const day = String(fechaVencimiento.getDate()).padStart(2, '0');
                    const fechaFormateada = `${year}-${month}-${day}`;

                    const response = await axios.post(`https://api-gestor-claves.up.railway.app/api/invitaciones/`, {
                        fecha_vencimiento: fechaFormateada  // Enviamos la fecha en formato YYYY-MM-DD
                    }, {
                        withCredentials: true
                    });

                    // Mostrar el token en una nueva alerta con botón de copiar
                    await Swal.fire({
                        title: 'Invitación creada',
                        html: `
                            El token de invitación es: <strong>${response.data.token}</strong>
                            <br><br>
                            Válido hasta: <strong>${fechaFormateada}</strong>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Copiar',
                        focusConfirm: false,
                        preConfirm: () => {
                            // Copiar el token al portapapeles
                            navigator.clipboard.writeText(response.data.token)
                                .then(() => {
                                    // Opcional: Mostrar un pequeño mensaje de que se copió
                                    Swal.showValidationMessage('Token copiado al portapapeles');
                                })
                                .catch(err => {
                                    Swal.showValidationMessage(`No se pudo copiar: ${err}`);
                                });
                        }
                    });

                } catch (err) {
                    await Swal.fire({
                        title: 'Error',
                        text: 'No se pudo crear la invitación',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                    console.error(err);
                }
            }
        })
    }
    crearInvitacion();

    const expulsarMiembro = () => {
        $('.btn-expulsar').click(async function () {
            const idUsuario = $(this).data('id-usuario');

            const confirmacion = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción expulsará al miembro.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, expulsar',
                cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                try {
                    await axios.delete(`https://api-gestor-claves.up.railway.app/api/familias/expulsar/${idUsuario}`, {
                        withCredentials: true
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Expulsado',
                        text: 'El miembro fue expulsado exitosamente.',
                    });

                    // Recargar la tabla después de expulsar
                    $('#tbody').empty();
                    getMiembros();

                } catch (err) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: err.response?.data?.message || "Error al expulsar al miembro",
                    });
                }
            }
        });
    }

    getMiembros();
});
