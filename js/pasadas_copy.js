/* pasadas_copy.js */

let datosJson = [];
let diametrosJson = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Cargar el JSON de configuración
        const respuestaConfig = await fetch('./json/configuracion.json');
        let datosCrudos = await respuestaConfig.json();
        
        // Normalizar la clave " salida" (con espacio) a "salida" por seguridad
        datosJson = datosCrudos.map(item => {
            const limpio = { ...item };
            if (' salida' in limpio && !('salida' in limpio)) {
                limpio.salida = limpio[' salida'];
                delete limpio[' salida'];
            }
            return limpio;
        });

        // 2. Cargar el JSON de diámetros para poder buscar los parámetros de cada caja
        const respuestaDiametros = await fetch('./json/diametros.json');
        diametrosJson = await respuestaDiametros.json();
        
        const selectPerfil = document.getElementById('selectPerfil'); //_J_ busca en HTML en atributo id="selectPerfil" y da el valor a selectPerfil

        if (!selectPerfil) return;

        // Limpiar el select por seguridad
        selectPerfil.innerHTML = '<option value="">-- Selecciona Perfil --</option>';

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
        console.error("Error al cargar los archivos JSON:", error);
    }
});

// 1. Cuando cambia el Perfil
function manejarCambioPerfil(e) {
    const perfilSeleccionado = e.target.value; //_j_ devuelve el perfil que se ha seleccionado, en número
    const zonaDinamica = document.getElementById('zonaSelectsDinamicos'); //_j_ busca y selecciona el contenedor vacío (<div id="zonaSelectsDinamicos"></div>) preparado en index.html
    
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

    // Buscar el objeto del perfil en el JSON (manejamos tanto 'salidas' como 'salida' por compatibilidad)
    const encontrado = datosJson.find(item => item.perfil == perfilSeleccionado); //_j_ recorre item por item el objeto datosJson
    const propiedadesSalida = encontrado ? (encontrado.salidas || encontrado.salida) : null;

    if (encontrado && propiedadesSalida) { 
        const opcionesSalida = Object.keys(propiedadesSalida); //_j_ Extrae las opciones disponibles (ej. ["29"] o ["29", "27"])
        console.log("Opciones de salida disponibles:", opcionesSalida);

        //_J_ Contamos cuántas opciones hay en salidas usando .length
        if (opcionesSalida.length === 1) {
            // CASO A: Si solo hay 1 opción (ej. solo "29"), NO hace desplegable y carga directo
            zonaDinamica.innerHTML = ''; 
            
            const unicaOpcion = opcionesSalida[0];
            const arrayCajas = propiedadesSalida[unicaOpcion];

            ejecutarAccionFinal(perfilSeleccionado, unicaOpcion, arrayCajas);

        } else if (opcionesSalida.length > 1) {
            //_j_ CASO B: Si hay varias (ej. ["29", "27"]), SÍ crea y muestra el segundo desplegable
            let htmlDinamico = `
                <div>
                    <label for="selectSalida"><p class="label_combobox_perfil">Salida: </p></label>
                    <select class="combobox_perfil" id="selectSalida">
                        <option value="">-- Selecciona tipo de salida --</option>
            `;

            opcionesSalida.forEach(valorSalida => { 
                htmlDinamico += `<option value="${valorSalida}">Salida por ${valorSalida}</option>`;
            });

            htmlDinamico += `
                    </select>
                </div>
            `;

            zonaDinamica.innerHTML = htmlDinamico; //_j_ lanza el segundo combo
            
            const selectSalidaElement = document.getElementById('selectSalida');
            if (selectSalidaElement) {
                selectSalidaElement.addEventListener('change', manejarCambioSalida); 
            }
        }

    } else {
        zonaDinamica.innerHTML = '';
    }
}

// 2. Cuando cambia la Salida (ej. elige '29' o '27')
function manejarCambioSalida(e) {
    const perfilSeleccionado = document.getElementById('selectPerfil').value; //_J_ perfil seleccionado
    const salidaSeleccionada = e.target.value; //_J_ saca el valor de la salida seleccionada

    if (!salidaSeleccionada) { 
        return;
    }

    const itemPerfil = datosJson.find(item => item.perfil == perfilSeleccionado); //_J_ busca en los datos JSON
    const propiedadesSalida = itemPerfil.salidas || itemPerfil.salida;
    const arrayCajas = propiedadesSalida[salidaSeleccionada]; // _J_ obtiene directamente el array de cajas de esa salida

    ejecutarAccionFinal(perfilSeleccionado, salidaSeleccionada, arrayCajas);
}


// 3. Función final: Recorre el array de cajas, busca en la lista plana de diametros.json aplicando variante:1 y perfil_cilindro si procede
function ejecutarAccionFinal(perfil, salida, arrayCajas) {
    console.log(`Cargando datos -> Perfil: ${perfil} | Salida por: ${salida}`);
    console.log("Array de cajas recibido:", arrayCajas);

    let arrayP = [];
    let contadorId = 1;

    // Verificamos que diametrosJson sea un array plano
    if (!Array.isArray(diametrosJson)) {
        console.error("⚠️ diametrosJson no es un array plano.");
        return;
    }

    arrayCajas.forEach(itemCaja => {
        let nombreCaja = "";
        let perfilBusqueda = perfil;

        // Comprobar si el ítem es un texto plano ("C26" o "AH") o un objeto complejo ({ caja: "C26", perfil_cilindro: 12 })
        if (typeof itemCaja === 'string') {
            nombreCaja = itemCaja;
        } else if (typeof itemCaja === 'object' && itemCaja !== null) {
            nombreCaja = itemCaja.caja;
            if (itemCaja.perfil_cilindro) {
                perfilBusqueda = itemCaja.perfil_cilindro; // Aplica el perfil específico (ej. 12 para salida por 27)
            }
        }

        let datosEncontrados = null;

        // Buscamos la caja en el array plano (coincidiendo con el id, ej: "AH", "C1", "C16", "26", "C27", etc.)
        // Normalizamos quitando la 'C' o probando ambas variantes
        const matchCaja = diametrosJson.find(c => {
            let idLimpio = c.id.toString().replace('C', '');
            let nombreLimpio = nombreCaja.toString().replace('C', '');
            return idLimpio === nombreLimpio || c.id === nombreCaja;
        });

        if (matchCaja) {
            // Caso A: La caja tiene la propiedad 'perfiles' (como C26, C27, C28, C29)
            if (matchCaja.perfiles && Array.isArray(matchCaja.perfiles)) {
                // Buscamos el perfil que coincida y que tenga variante 1 (o la variante por defecto)
                const matchPerfil = matchCaja.perfiles.find(p => p.perfil == perfilBusqueda && (p.variante || 1) === 1);
                
                if (matchPerfil) {
                    datosEncontrados = {
                        id: matchCaja.id.startsWith('C') ? matchCaja.id : `C${matchCaja.id}`,
                        nombre: matchCaja.nombre,
                        tipo: matchCaja.tipo,
                        ...matchPerfil
                    };
                }
            } 
            // Caso B: La caja tiene múltiples variantes planas (ej. C16, C17, etc., donde cada variante es un objeto en la misma lista o similar)
            else if (matchCaja.variante !== undefined) {
                // Si hay varias entradas con el mismo id pero distinta variante, buscamos la variante 1
                const matchVariante = diametrosJson.find(c => {
                    let idLimpio = c.id.toString().replace('C', '');
                    let nombreLimpio = nombreCaja.toString().replace('C', '');
                    return (idLimpio === nombreLimpio || c.id === nombreCaja) && (c.variante || 1) === 1;
                });
                if (matchVariante) {
                    datosEncontrados = { ...matchVariante };
                }
            } 
            // Caso C: Es una caja simple de una sola línea (AH, BH, CV, C1 a C15)
            else {
                datosEncontrados = { ...matchCaja };
            }
        }

        // Si se encontraron los datos, los agregamos al array final 'arrayP'
        if (datosEncontrados) {
            arrayP.push({
                id: datosEncontrados.id.toString().startsWith('C') ? datosEncontrados.id : `C${datosEncontrados.id}`,
                nombre: datosEncontrados.nombre || `Caja ${nombreCaja}`,
                tipo: datosEncontrados.tipo || "ovalo",
                B: datosEncontrados.B,
                H: datosEncontrados.H,
                R: datosEncontrados.R || datosEncontrados.R1 || 50,
                r: datosEncontrados.r !== undefined ? datosEncontrados.r : 1.5,
                a: datosEncontrados.a !== undefined ? datosEncontrados.a : 0,
                n: datosEncontrados.n !== undefined ? datosEncontrados.n : 40,
                R1: datosEncontrados.R1,
                R2: datosEncontrados.R2,
                Valor_luz: 10,
                R_transfor: 1.2
            });
        } else {
            console.warn(`⚠️ No se encontraron datos en diametros.json para la caja: ${nombreCaja} con perfil: ${perfilBusqueda}`);
        }
        contadorId++;
    });

    console.log("🎯 Array 'p' generado con éxito desde la lista plana:", arrayP);
    
    // Dejamos listo el array en la variable global para cuando lo requiera la lámina 3
    window.pasadas_55 = arrayP;
}