/* pasadas_copy.js */

let datosJson = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Cargar el JSON (asegúrate de que la ruta sea correcta respecto a tu HTML)
        const respuesta = await fetch('./json/config_luces_RS_resto.json');
        datosJson = await respuesta.json();
        
        const selectPerfil = document.getElementById('selectPerfil'); //_J_ busca en HTML en atributo id="selectPerfil" y da el valor a selectPerfil

        if (!selectPerfil) return;

        // Poblar el primer combobox con los perfiles del JSON usando forEach
        datosJson.forEach(item => {
            const option = document.createElement('option');
            option.value = item.perfil;
            option.textContent = `${item.perfil} mm`;
            selectPerfil.appendChild(option);
        });

        // Escuchar cuando el usuario cambia el perfil
        selectPerfil.addEventListener('change', manejarCambioPerfil); //_J_ va implícito en el select el valor (E), no hace falta dárselo de nuevo

    } catch (error) {
        console.error("Error al cargar el archivo JSON de configuración:", error);
    }
});

// 1. Cuando cambia el Perfil
function manejarCambioPerfil(e) {
    const perfilSeleccionado = e.target.value; //_j_ devuelve el perfil que se ha seleccionado, en número
    const zonaDinamica = document.getElementById('zonaSelectsDinamicos'); //_j_ busca y selecciona el contenedor vacío (<div id="zonaSelectsDinamicos"></div>)  preparado en  index.html
    
    //_j_ Protección crucial: Si no existe el contenedor en el DOM, detenemos la ejecución para evitar el error
    if (!zonaDinamica) {
        console.warn("⚠️ No se encontró el contenedor 'zonaSelectsDinamicos' en el DOM.");
        return;
    }

    // Limpiar zona dinámica si no hay perfil seleccionado
    if (!perfilSeleccionado) {
        zonaDinamica.innerHTML = '';
        return;
    }

    // Buscar el objeto del perfil en el JSON
    const encontrado = datosJson.find(item => item.perfil == perfilSeleccionado); //_j_ recorre item por item el objeto datosJson, hasta encontrar si el perfilseleccionado corresponde con el item

    if (encontrado && encontrado.RSM_a) { //_J_ si hay un perfil encontrado y si hay en ese perfil un RSM_a
        const opcionesRsma = Object.keys(encontrado.RSM_a); //_j_ Extrae las opciones disponibles (ej. ["4"] o ["4", "2"])

        //_J_ Contamos cuántas opciones hay en RSM_a usando .length
        if (opcionesRsma.length === 1) {
            // CASO A: Si solo hay 1 opción (ej. Perfil 7 con solo "4"), NO hace desplegable y carga directo
            zonaDinamica.innerHTML = ''; 
            
            const unicaOpcion = opcionesRsma[0];
            const arrayCajas = encontrado.RSM_a[unicaOpcion];

            ejecutarAccionFinal(perfilSeleccionado, unicaOpcion, arrayCajas);

        } else if (opcionesRsma.length > 1) {
            //_j_ CASO B: Si hay varios (ej. ["4", "2"]), SÍ crea y muestra el segundo desplegable
            //_j_  htmlDinamico += añade la etiqueta del combobox de seleccionar a 2 o 4 cajas
            let htmlDinamico = `
                <div>
                    <label for="selectRSMA"><p class="label_combobox_perfil">RSM_a: </p></label>
                    <select class="combobox_perfil" id="selectRSMA">
                        <option value="">Configuración de RSM</option>
            `;

            opcionesRsma.forEach(valorRsma => { 
                htmlDinamico += `<option value="${ valorRsma}">A ${valorRsma} cajas</option>`;
            });

            htmlDinamico += `
                    </select>
                </div>
            `;

            zonaDinamica.innerHTML = htmlDinamico; //_j_ lanza el segundo combo
            
            const selectRsmaElement = document.getElementById('selectRSMA');
            if (selectRsmaElement) {
                selectRsmaElement.addEventListener('change', manejarCambioRsma); 
            }
        }

    } else {
        zonaDinamica.innerHTML = '';
    }
}

// 2. Cuando cambia el RSM_a (ej. elige '4' o '2')
function manejarCambioRsma(e) {
    const perfilSeleccionado = document.getElementById('selectPerfil').value; //_J_ perfil seleccionado viene del (e) de document
    const rsmaSeleccionado = e.target.value; //_J_ saca los valores de (e) con perfil seleccionado

    if (!rsmaSeleccionado) { 
        return;
    }

    const itemPerfil = datosJson.find(item => item.perfil == perfilSeleccionado); //_J_ busca en los datos JSON item por item si hay algo = a perfilseleccionado
    const arrayCajas = itemPerfil.RSM_a[rsmaSeleccionado]; // _J_ obtiene directamente el array de 4 o de 2

    ejecutarAccionFinal(perfilSeleccionado, rsmaSeleccionado, arrayCajas);
}

// 4. Función final que procesa los datos y pinta las tablas o tarjetas en el DOM
function ejecutarAccionFinal(perfil, rsma, arrayCajas) {
    console.log(`Cargando datos -> Perfil: ${perfil} | RSM_a: ${rsma}`);
    console.log("Array de cajas resultante:", arrayCajas);
}