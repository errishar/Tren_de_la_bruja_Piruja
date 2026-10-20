document.addEventListener("DOMContentLoaded", () => {
    // Buscamos un contenedor específico en la página para meter el texto
    const contenedorFooter = document.getElementById("membrete");
    
    if (contenedorFooter) {
        contenedorFooter.innerHTML = `
            <img src="./img/piruja.jpg" alt="">
            <h3>Tren de la bruja Piruja</h3>
            <p class="txtRegistro">ver:1.3 © Chilindri.GmBH</p>
            <p class="txtRegistro">Sale mal el modelo óvalo-redondo</p>
        `;
    }
});