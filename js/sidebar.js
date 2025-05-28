$(document).ready(async function () {
    try {
        const respuesta = await axios.get('https://api-gestor-claves.up.railway.app/api/auth/session', { withCredentials: true });
        const { id } = respuesta.data.session.rol;

        if (id !== 1) {
            $('li:contains("Gestionar Categorias")').hide();
            $('li:contains("Gestionar Usuarios")').hide();
            $('li:contains("Gestionar Familias")').hide();
        }
    } catch (err) {
        console.log(err);
    }
});