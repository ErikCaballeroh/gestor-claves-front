$(document).ready(function () {
    const getSession = async () => {
        const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/auth/session/', {
            withCredentials: true
        });

        const familia = respuesta.data.session.familia;
        console.log(familia);

        if (familia !== null) {
            $('#card-crear-familia').hide();
            $('#card-aceptar-invitacion').hide();
            $('#card-crear-familia').before(`
                <div class="card mb-4" id="card-crear-familia">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="lni lni-plus"></i> Nombre: ${familia.nombre}
                        </h5>
                    </div>
                    <div class="card-body">
                        <p>Actualmente usted ya pertenece a una familia</p>
                    </div>
                </div>    
            `);
        }
    }

    getSession();


    $('#aceptar-invitacion').click(async function () {
        try {
            const token = $('#token').val();
            console.log(token);

            const respuesta = await axios.post(`https://api-gestor-claves.up.railway.app/api/invitaciones/aceptar/${token}`, {}, {
                withCredentials: true
            });

            Swal.fire({
                title: "Invitacion valida!",
                text: respuesta.data.message,
                icon: "success",
            }).then(() => {
                location.reload();
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response.data.message,
            });
        }
    })

    $('#formCrearFamilia').on('submit', async function (e) {
        e.preventDefault();
        const nombre = $('#nombre-familia').val();
        const datos = { nombre };

        try {
            const respuesta = await axios.post('https://api-gestor-claves.up.railway.app/api/familias/', datos, {
                withCredentials: true
            });
            if (respuesta.status === 201) {
                Swal.fire({
                    title: "Familia creada!",
                    text: respuesta.data.message,
                    icon: "success",
                }).then(() => {
                    location.reload();
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response.data.message,
            });
        }

    });

});