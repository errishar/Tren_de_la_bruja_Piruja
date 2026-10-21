document.addEventListener("DOMContentLoaded", () => {
    // Buscamos el contenedor del pie con su id único
    const contenedorFooter = document.getElementById("pie");

    if (contenedorFooter) {
        contenedorFooter.innerHTML = `
            <p class="txtRegistro">ver:1.3 © Chilindri.GmBH</p>
        `;
    }
});