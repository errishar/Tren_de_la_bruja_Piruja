document.addEventListener("DOMContentLoaded", () => {
    // Buscamos un contenedor específico en la página para meter el texto
    const contenedorHeader = document.getElementById("membrete");

    if (contenedorHeader) {
        contenedorHeader.innerHTML = `
        <table>
        <td class= "logo">
                <img class="img" src="./img/piruja.jpg" >
                <h3 class="titulo_tren_de_la_bruja">Tren de la bruja Piruja</h3>
        </td>
        <td>
            <h3 class="mensaje_desarrollador">Mensaje del desarrollador:</strong></h>
            <p class="txtMensaje">- Sale mal el modelo óvalo-redondo (estoy en ello, no sé como, pero estar, estoy)</p>
            <p class="txtMensaje">- Si no lo ves o hace piruladas, mándame un WhatsApp, que a lo mejor estoy haciendo piruladas.</p>
            <p class="txtMensaje">- Se admiten sugerencias. SIEMPRE</p>
        </td>
</table>
        
        `;
    }
});