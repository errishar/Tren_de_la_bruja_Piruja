/* pasadas_copy.js */

let datosJson = [];
let diametrosJson = [];

// Declaramos y exportamos pasadas_55 para que los módulos puedan importarla
export let pasadas_55 = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Cargar el JSON de configuración
        const respuestaConfig = await fetch('./json/configuracion.json');
        let datosCrudos = await respuestaConfig.json();
        
        datosJson = datosCrudos.map(item => {
            const limpio = { ...item };
            if (' salida' in limpio && !('salida' in limpio)) {
                limpio.salida = limpio[' salida'];
                delete limpio[' salida'];
            }
            return limpio;
        });

        // 2. Cargar el JSON de diámetros
        const respuestaDiametros = await fetch('./json/diametros.json');
        diametrosJson = await respuestaDiametros.json();
        
        const selectPerfil = document.getElementById('selectPerfil');
        if (!selectPerfil) return;

        selectPerfil.innerHTML = '<option value="">-- Selecciona Perfil --</option>';

        datosJson.forEach(item => {
            const option = document.createElement('option');
            option.value = item.perfil;
            option.textContent = `${item.perfil} mm`;
            selectPerfil.appendChild(option);
        });

        selectPerfil.addEventListener('change', manejarCambioPerfil);

    } catch (error) {
        console.error("Error al cargar los archivos JSON:", error);
    }
});

function manejarCambioPerfil(e) {
    const perfilSeleccionado = e.target.value;
    const zonaDinamica = document.getElementById('zonaSelectsDinamicos');
    
    if (!zonaDinamica) return;

    if (!perfilSeleccionado) {
        zonaDinamica.innerHTML = '';
        return;
    }

    const encontrado = datosJson.find(item => item.perfil == perfilSeleccionado);
    const propiedadesSalida = encontrado ? (encontrado.salidas || encontrado.salida) : null;

    if (encontrado && propiedadesSalida) { 
        const opcionesSalida = Object.keys(propiedadesSalida);

        if (opcionesSalida.length === 1) {
            zonaDinamica.innerHTML = ''; 
            const unicaOpcion = opcionesSalida[0];
            const arrayCajas = propiedadesSalida[unicaOpcion];
            ejecutarAccionFinal(perfilSeleccionado, unicaOpcion, arrayCajas);
        } else if (opcionesSalida.length > 1) {
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

            zonaDinamica.innerHTML = htmlDinamico;
            
            const selectSalidaElement = document.getElementById('selectSalida');
            if (selectSalidaElement) {
                selectSalidaElement.addEventListener('change', manejarCambioSalida); 
            }
        }
    } else {
        zonaDinasicas.innerHTML = '';
    }
}

function manejarCambioSalida(e) {
    const perfilSeleccionado = document.getElementById('selectPerfil').value;
    const salidaSeleccionada = e.target.value;

    if (!salidaSeleccionada) return;

    const itemPerfil = datosJson.find(item => item.perfil == perfilSeleccionado);
    const propiedadesSalida = itemPerfil.salidas || itemPerfil.salida;
    const arrayCajas = propiedadesSalida[salidaSeleccionada];

    ejecutarAccionFinal(perfilSeleccionado, salidaSeleccionada, arrayCajas);
}

function ejecutarAccionFinal(perfil, salida, arrayCajas) {
    console.log(`Cargando datos -> Perfil: ${perfil} | Salida por: ${salida}`);
    let arrayP = [];

    if (!Array.isArray(diametrosJson)) return;

    arrayCajas.forEach(itemCaja => {
        let nombreCaja = "";
        let perfilBusqueda = perfil;

        if (typeof itemCaja === 'string') {
            nombreCaja = itemCaja;
        } else if (typeof itemCaja === 'object' && itemCaja !== null) {
            nombreCaja = itemCaja.caja;
            if (itemCaja.perfil_cilindro) {
                perfilBusqueda = itemCaja.perfil_cilindro;
            }
        }

        let datosEncontrados = null;
        const matchCaja = diametrosJson.find(c => {
            let idLimpio = c.id.toString().replace('C', '');
            let nombreLimpio = nombreCaja.toString().replace('C', '');
            return idLimpio === nombreLimpio || c.id === nombreCaja;
        });

        if (matchCaja) {
            if (matchCaja.perfiles && Array.isArray(matchCaja.perfiles)) {
                const matchPerfil = matchCaja.perfiles.find(p => p.perfil == perfilBusqueda && (p.variante || 1) === 1);
                if (matchPerfil) {
                    datosEncontrados = {
                        id: matchCaja.id.startsWith('C') ? matchCaja.id : `C${matchCaja.id}`,
                        nombre: matchCaja.nombre,
                        tipo: matchCaja.tipo,
                        ...matchPerfil
                    };
                }
            } else if (matchCaja.variante !== undefined) {
                const matchVariante = diametrosJson.find(c => {
                    let idLimpio = c.id.toString().replace('C', '');
                    let nombreLimpio = nombreCaja.toString().replace('C', '');
                    return (idLimpio === nombreLimpio || c.id === nombreCaja) && (c.variante || 1) === 1;
                });
                if (matchVariante) datosEncontrados = { ...matchVariante };
            } else {
                datosEncontrados = { ...matchCaja };
            }
        }

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
                D_max: datosEncontrados.D_max, // <-- ¡Añadir esta línea!
                D_min: datosEncontrados.D_min, // <-- ¡Añadir esta línea!
                Valor_luz: 10,
                R_transfor: 1.2
            });
        }
    });

    // Actualizamos tanto la variable exportada como la global de respaldo
    pasadas_55.length = 0;
    pasadas_55.push(...arrayP);
    window.pasadas_55 = arrayP;

    console.log("🎯 Array 'p' generado con éxito:", arrayP);
}

export function generarPasadas55() {
    return pasadas_55;
}