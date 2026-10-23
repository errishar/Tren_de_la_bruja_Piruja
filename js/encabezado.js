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
            <p class="txtMensaje">- La laminación que es lo importante sigue mal, sigo en ello</p>
            <p class="txtMensaje">- Selecciona por Perfil y palanquilla de entrada.</p>
            <p class="txtMensaje">- Luces están mal, tengo que ir modificando.</p>
            <p class="txtMensaje">- Se admiten sugerencias. SIEMPRE</p>
        </td>
</table>
        
        `;
    }
});