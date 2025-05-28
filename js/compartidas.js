$(document).ready(function () {

    const getClaves = async () => {
        try {
            const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/familias/claves', {
                withCredentials: true
            });

            const claves = respuesta.data;

            console.log(claves);

            claves.map(c => {
                $('#tbody').append(`
                    <tr>
                        <td>${c.nombre_usuario}</td>
                        <td>${c.nombre_clave}</td>
                        <td>${c.sitio}</td>
                        <td>${c.usuario}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <input type="password" class="form-control w-75 me-2" value="${c.clave}">
                                <button type="button" class="btn btn-primary ver-btn" style="min-width: 85px;">Ver</button>
                            </div>
                        </td>
                    </tr>
                `);
            });

            // Evento usando closest
            $(document).on('click', '.ver-btn', function () {
                const input = $(this).closest('div').find('input');
                const tipo = input.attr('type');

                if (tipo === 'password') {
                    input.attr('type', 'text');
                    $(this).text('Ocultar');
                } else {
                    input.attr('type', 'password');
                    $(this).text('Ver');
                }
            });

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response.data.message,
            });
        }
    }

    getClaves();
});
