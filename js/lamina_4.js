/* lamina_4.js */

import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM, relleno_palanquilla } from './cilindro.js';
import { simetria, calcularAreaDesdePuntos, aplicarLuz } from './calculos.js';
import { graficarCilindroGenerico } from './grafica.js';
import { 
    generarPerfilSalidaEkelund, 
    generarPerfilSalidaEkelundZheng2, 
    generarPerfilSalidaEkelundZheng, 
    generarPerfilsalidahinokura, 
    generarPerfilsalidahinokura2, 
    generarPerfilsalidahinokura3, 
    generarPerfilSalidaZheng, 
    rotarSalidaAEntrada, 
    generarPerfilSalidaTafelSedlaczek, 
    generarPerfilSalidaKoncevicz 
} from './calculo_laminación.js';

const n_puntos = 10; //_j_ puntos por mm


let diametrosJsonData = [];
let configuracionJsonData = [];

// ==========================================
// MOTOR DE BÚSQUEDA Y GENERACIÓN DINÁMICA
// ==========================================
function procesarCajasParaPerfil(perfilSeleccionado, salidaSeleccionada) {
    let arrayP = [];

    const encontrado = configuracionJsonData.find(item => item.perfil == perfilSeleccionado); //_j_ recorre item por item el objeto configuracionJsonData
    const propiedadesSalida = encontrado ? (encontrado.salidas || encontrado.salida) : null;

    if (!encontrado || !propiedadesSalida) return arrayP;

    const opcionesSalida = Object.keys(propiedadesSalida); //_j_ Extrae las opciones disponibles (ej. ["29"] o ["29", "27"])
    let salidaUsada = salidaSeleccionada && propiedadesSalida[salidaSeleccionada] ? salidaSeleccionada : opcionesSalida[0];
    const arrayCajas = propiedadesSalida[salidaUsada]; // _J_ obtiene directamente el array de cajas de esa salida

    if (!arrayCajas || !Array.isArray(arrayCajas)) return arrayP;

    let contadorId = 1;

    arrayCajas.forEach(itemCaja => {
        let nombreCaja = "";
        let perfilBusqueda = perfilSeleccionado;

        //_U_ Comprobar si el ítem es un texto plano ("C26") o un objeto complejo ({ caja: "C26", perfil_cilindro: 12 }) FALLA
        if (typeof itemCaja === 'string') {
            nombreCaja = itemCaja;
        } else if (typeof itemCaja === 'object' && itemCaja !== null) {
            nombreCaja = itemCaja.caja;
            if (itemCaja.perfil_cilindro) {
                perfilBusqueda = itemCaja.perfil_cilindro; // Aplica el perfil específico (ej. 12 para salida por 27)
            }
        }

        let datosEncontrados = null;

        // Búsqueda en la lista plana de diametros.json
        const matchCaja = diametrosJsonData.find(c => {
            let idLimpio = c.id.toString().replace('C', '');
            let nombreLimpio = nombreCaja.toString().replace('C', '');
            return idLimpio === nombreLimpio || c.id === nombreCaja;
        });

        if (matchCaja) {
            // Caso A: La caja tiene la propiedad 'perfiles' (como C26, C27, etc.)
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
            } else {
                // Caso B: Es una caja simple de una sola línea
                datosEncontrados = { ...matchCaja };
            }
        }

        // Si se encontraron los datos, los agregamos al array final 'arrayP'
        if (datosEncontrados) {
            arrayP.push({
                id: datosEncontrados.id || `C${contadorId}`,
                nombre: datosEncontrados.nombre || `Caja ${nombreCaja}`,
                tipo: datosEncontrados.tipo || "ovalo",
                B: datosEncontrados.B,
                H: datosEncontrados.H,
                R: datosEncontrados.R || datosEncontrados.R1 || 50,
                r: datosEncontrados.r !== undefined ? datosEncontrados.r : 1.5,
                a: datosEncontrados.a !== undefined ? datosEncontrados.a : 0,
                n: datosEncontrados.n !== undefined ? datosEncontrados.n : n_puntos,
                R1: datosEncontrados.R1,
                R2: datosEncontrados.R2,
                Valor_luz: 10,
                R_transfor: 1.2
            });
        }
        contadorId++;
    });

    return arrayP;
}

// ==========================================
// GESTIÓN DE LOS COMBOBOXES (DINÁMICO)
// ==========================================
function manejarCambioPerfil(e) {
    
    const perfilSeleccionado = e.target.value; //_j_ devuelve el perfil que se ha seleccionado, en número
    const zonaDinamica = document.getElementById('zonaSelectsDinamicos'); //_j_ busca y selecciona el contenedor vacío preparado en index.html
    
    ///_j_ MACHETAZO 1: Destrucción inmediata del contenedor y vaciado de memoria global
    window.pasadas_55 = [];
    const contenedor = document.getElementById("contenedor-tablas");
    if (contenedor) {
        contenedor.innerHTML = ""; // Borra todo el DOM de las tarjetas y canvas de golpe
    }

    //_j_ Protección crucial: Si no existe el contenedor en el DOM, detenemos la ejecución para evitar el error
    if (!zonaDinamica) return;

    // Limpiar zona dinámica si no hay perfil seleccionado
    if (!perfilSeleccionado) {
        zonaDinamica.innerHTML = '';
        window.pasadas_55 = [];
        actualizarPasadas();
        return;
    }

    const encontrado = configuracionJsonData.find(item => item.perfil == perfilSeleccionado);
    const propiedadesSalida = encontrado ? (encontrado.salidas || encontrado.salida) : null;

    if (encontrado && propiedadesSalida) { 
        const opcionesSalida = Object.keys(propiedadesSalida); //_j_ Extrae las opciones disponibles (ej. ["29"] o ["29", "27"])

        //_J_ Contamos cuántas opciones hay en salidas usando .length
        if (opcionesSalida.length === 1) {
            // _J_CASO A: Si solo hay 1 opción (ej. solo "29"), NO hace desplegable y carga directo
            zonaDinamica.innerHTML = ''; 
            const unicaOpcion = opcionesSalida[0];
            
            window.pasadas_55 = procesarCajasParaPerfil(perfilSeleccionado, unicaOpcion);
            actualizarPasadas();

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

            window.pasadas_55 = procesarCajasParaPerfil(perfilSeleccionado, opcionesSalida[0]);
            actualizarPasadas();
        }
    } else {
        zonaDinamica.innerHTML = '';
    }
}

function manejarCambioSalida(e) {
    const perfilSeleccionado = document.getElementById('selectPerfil').value; //_J_ perfil seleccionado
    const salidaSeleccionada = e.target.value; //_J_ saca el valor de la salida seleccionada

    //_j_ MACHETAZO 1: Destrucción inmediata del contenedor y vaciado de memoria global
    window.pasadas_55 = [];
    const contenedor = document.getElementById("contenedor-tablas");
    if (contenedor) {
        contenedor.innerHTML = ""; // Borra todo el DOM de las tarjetas y canvas de golpe
    }

    if (!salidaSeleccionada) return;

    window.pasadas_55 = procesarCajasParaPerfil(perfilSeleccionado, salidaSeleccionada);
    actualizarPasadas();
}

// ==========================================
// FUNCIÓN PRINCIPAL DE RENDERIZADO
// ==========================================
function actualizarPasadas() {
    const contenedor = document.getElementById("contenedor-tablas");
    if (!contenedor) return;

    //_j_ Guardar la posición del scroll antes de actualizar
    let scrollPos = window.scrollY;

    //_j_ 1. Obtener palanquilla seleccionada y área inicial
    let radioSeleccionado = document.querySelector('input[name="palanquilla"]:checked');
    let valorPalanquilla = radioSeleccionado ? parseFloat(radioSeleccionado.value) : 150;
    let rellenocuadrante = relleno_palanquilla(valorPalanquilla, n_puntos);
    // _Ja_  console.log("Panaquilla: ", rellenocuadrante );
    let areaEntradaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);

    contenedor.innerHTML = "";

    const listaPasadas = window.pasadas_55 || [];
    listaPasadas.forEach((p) => {
        // Obtener parámetros seguros (modificados o originales) 
        let luzVal = p.Valor_luz_modificado !== undefined ? p.Valor_luz_modificado : (p.Valor_luz || 10);
        let bVal = p.B_modificado !== undefined ? p.B_modificado : p.B;
        let hVal = p.H_modificado !== undefined ? p.H_modificado : p.H;
        let rVal = p.r_modificado !== undefined ? p.r_modificado : p.r;
        let r1Val = p.R1_modificado !== undefined ? p.R1_modificado : p.R1;
        let r2Val = p.R2_modificado !== undefined ? p.R2_modificado : p.R2;
        let rGenVal = p.R_modificado !== undefined ? p.R_modificado : p.R;
        let aVal = p.a_modificado !== undefined ? p.a_modificado : p.a;
        let nVal = p.n_modificado !== undefined ? p.n_modificado : p.n;

        let min_R_Tabla = p.R_Tabla_min !== undefined ? p.R_Tabla_min : 100;
        let max_R_Tabla = p.R_Tabla_max !== undefined ? p.R_Tabla_max : 1000;
        let R_Tabla_original = (max_R_Tabla + min_R_Tabla) / 2;
        let R_Tabla = p.R_Tabla_modificado !== undefined ? p.R_Tabla_modificado : R_Tabla_original;

        // Y al generar la geometría pasas estas variables seguras:
        let perfilCuadrante;
        if (p.tipo === "AH") {perfilCuadrante = cilindro_AH(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal, aVal);} 
        else if (p.tipo === "ovalo") {perfilCuadrante = cilindro_ovalo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal);} 
        else if (p.tipo === "redondo") {perfilCuadrante = cilindro_redondo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal, aVal || 30);} 
        else if (p.tipo === "C1") {perfilCuadrante = cilindro_C1(nVal || p.n || n_puntos, bVal, hVal, r1Val, r2Val, rVal);} 
        else if (p.tipo === "RSM") {perfilCuadrante = cilindro_RSM(nVal || p.n || n_puntos, bVal, hVal, rGenVal, aVal || 100, nVal || 2);} 
        else {perfilCuadrante = cilindro_ovalo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal);}
            
        let perfilConLuz = aplicarLuz(perfilCuadrante, luzVal);
        let perfilSimetrico = simetria(perfilConLuz);
        let areaSalidaTotal ;
        let rTransVal ;
        console.log("Hacemos los perfiles de la caja: ", p.nombre);
        if (p.tipo === "AH") {
            let mu = 0.35;
            
            // _Ja_ console.log("rellenocuadrante",p.nombre,": ", rellenocuadrante);
            // _Ja_ console.log("perfilCuadrante",p.nombre,": ", perfilCuadrante);
            // _Ja_ console.log("luzVal",p.nombre,": ", luzVal);
            // _Ja_ console.log("R_nom",p.nombre,": ", R_Tabla);
            // _Ja_ console.log("mu",p.nombre,": ",mu);
            
            rellenocuadrante = generarPerfilSalidaEkelundZheng2(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, mu, n_puntos);
            /*
                _M_ rellenocuadrante = generarPerfilSalidaEkelundZheng(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, mu, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaEkelundZheng2(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, mu, n_puntos);
                _M_ rellenocuadrante = generarPerfil salidahinokura(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
                _M_ rellenocuadrante = generarPerfil salidahinokura2(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
                _M_ rellenocuadrante = generarPerfil salidahinokura3(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
                _M_ rellenocuadrante =generarPerfilSalidaTafelSedlaczek(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaKoncevicz(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaZheng(perfilCilindro, P_in, g, R_Tabla, m_material = 1.25, gamma = 0.97, maxIter = 3);
            */    
            areaSalidaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);
            rTransVal = areaEntradaTotal/areaSalidaTotal ;
        } else {
            let alpha = 0.85;
           
            // _Ja_ console.log("rellenocuadrante",p.nombre,": ", rellenocuadrante);
            // _Ja_ console.log("perfilCuadrante",p.nombre,": ", perfilCuadrante);
            // _Ja_ console.log("luzVal",p.nombre,": ", luzVal);
            // _Ja_ console.log("R_nom",p.nombre,": ", R_Tabla);
            // _Ja_ console.log("alpha",p.nombre,": ",alpha);

            if (p.nombre !=="BH" && p.nombre !=="CV" ){
                rellenocuadrante = rotarSalidaAEntrada(rellenocuadrante);
            }
            console.log("Haciendo el modelo Perfil de salida Shinokura versión 3 para la caja :", p.nombre);
            rellenocuadrante = generarPerfilsalidahinokura3(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
            /* 
                _M_ rellenocuadrante = generarPerfil salidahinokura(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
                _M_ rellenocuadrante = generarPerfil salidahinokura2(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
                _M_ rellenocuadrante = generarPerfil salidahinokura3(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
                _M_ rellenocuadrante =generarPerfilSalidaTafelSedlaczek(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaKoncevicz(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaZheng(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, 1.25, (p.tipo === "redondo") ? 0.83 : 0.97, 3);
            */

            areaSalidaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);            
            rTransVal = areaEntradaTotal/areaSalidaTotal ;
        }
        
        let rellenoSimetrico = simetria(rellenocuadrante);

        // Crear Tarjeta DOM
        const card = document.createElement("div");
        card.className = "cilindro-card";
        const canvasId = `canvas_${p.id}`;

        const tipoCilindro = p.tipo || "AH";
        const areaEntradaFmt = areaEntradaTotal.toFixed(2);
        const areaSalidaFmt = areaSalidaTotal.toFixed(2);
        const rTransFmt = rTransVal.toFixed(1);

        const xVals = (rellenoSimetrico && rellenoSimetrico.X_sup && rellenoSimetrico.X_sup.length > 0) ? rellenoSimetrico.X_sup : [0];
        const yVals = (rellenoSimetrico && rellenoSimetrico.Y_sup && rellenoSimetrico.Y_sup.length > 0) ? rellenoSimetrico.Y_sup : [0];

        const anchomax = ((Math.max(...xVals))*2).toFixed(0);
        const altomax = (Math.max(...yVals) * 2).toFixed(0);

        const Luz_teor = p.Valor_luz.toFixed(0);
        const R_teor = p.R_transfor.toFixed(1);

        card.innerHTML = `
            <h2>${p.nombre}</h2>
            <div class="pasada-content" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                <div class="grafica-container" style="flex: 1; min-width: 300px; max-width: 800px;">
                    <canvas id="${canvasId}"></canvas>` + // _H_ Parte izquierda de la pantalla
                            `
                    <div style="margin-top: 15px; border-top: 1px solid #dee2e6; padding-top: 10px;">
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; font-weight: bold;">R. Transformación: 
                                    <input type="number" class="input-rtrans-num" data-id="${p.id}" value="${rTransFmt}" step="0.1" 
                                    ` + // _H_ determina el scroll de R, trata este HTML como una cadena de texto
                            `
                                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                                </label>
                                <button class="btn-reset-param" data-id="${p.id}" data-param="rtrans" style="background: none; border: none; color: #007bff; cursor: pointer; font-size: 0.8em;">↺ Reset R.T.</button>
                            ` + // _H_ determina el máximo y mínimo del scroll de luz, trata este HTML como una cadena de texto
                            `
                                </div>
                            <input type="range" class="slider-rtrans" data-id="${p.id}" min="0.5" max="2.5" step="0.01" value="${rTransVal}" style="width: 100%;">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; font-weight: bold;">Luz (mm): 
                                    <input type="number" class="input-luz-num" data-id="${p.id}" value="${luzVal}" step="0.1" 
                                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                                </label> <!-- determina el label de luz-->
                                <button class="btn-reset-param" data-id="${p.id}" data-param="luz" style="background: none; border: none; color: #007bff; cursor: pointer; font-size: 0.8em;">↺ Reset Luz</button>
                            
                            </div>
                            <input type="range" class="slider-luz" data-id="${p.id}" min="0" max="${Luz_teor*2}" step="0.1" value="${luzVal}" style="width: 100%;">
                        `+ // _H_ determina el máximo y mínimo del scroll de luz, trata este HTML como una cadena de texto
                        `
                            </div>
                        <button class="btn-reset-todo" data-id="${p.id}" style="width: 100%; background-color: #6c757d; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-top: 5px;">↺ Restablecer Todo</button>
                    </div>
                </div>
                ` + // _H_ La tarjeta de "Datos de la Pasada la convierto en una tabla de datos"
                `
                <div class="datos-pasada-card" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; min-width: 250px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="margin-top: 0; font-size: 1.1em; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Datos de la Pasada</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.95em;">
                        <tbody>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Caja:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${p.id}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Tipo Cilindro:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${tipoCilindro}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Área Entrada:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${areaEntradaFmt} mm²</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Área Salida:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${areaSalidaFmt} mm²</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">R. Transformación:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${rTransFmt} (${R_teor})</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Luz:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${luzVal} (${Luz_teor}) mm</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Ancho de figura:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${anchomax} mm</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Alto de figura:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${altomax} mm</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        contenedor.appendChild(card);

        const miAccionAlPulsar = () => { //_j_ Abre la página de detalle en una pestaña o ventana aparte
            window.open(`detalle_canal.html?id=${p.id}`, '_blank');
        };

        //_J_Renderizar la gráfica
        graficarCilindroGenerico(canvasId, perfilSimetrico, rellenoSimetrico, miAccionAlPulsar);

        //_J_ Actualizar área de entrada para la siguiente pasada
        areaEntradaTotal = areaSalidaTotal;
    });

    vincularEventosControles();//_j_ Llamo a la función para estar a la espera de cualquier evento
    window.scrollTo({ top: scrollPos, behavior: 'instant' }); //_j_ Te lleva a la posición de la ventana HTML tomada antes de 
}

function vincularEventosControles() {
    document.querySelectorAll('.slider-rtrans, .slider-luz').forEach(slider => { //_j_ deslizamiento del scroll de luz o R
        slider.addEventListener('input', (e) => {
            const idCaja = e.target.dataset.id;
            const valor = parseFloat(e.target.value);
            const esLuz = e.target.classList.contains('slider-luz');
            let pasada = window.pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                if (esLuz) pasada.Valor_luz_modificado = valor;
                else pasada.R_transfor_modificado = valor;
                actualizarPasadas();
            }
        });
    });

    document.querySelectorAll('.input-rtrans-num, .input-luz-num').forEach(input => { //_j_ entrada de dato de luz en el label o R
        input.addEventListener('change', (e) => {
            const idCaja = e.target.dataset.id;
            let valor = parseFloat(e.target.value);
            const esLuz = e.target.classList.contains('input-luz-num');
            if (isNaN(valor)) return;
            let pasada = window.pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                if (esLuz) pasada.Valor_luz_modificado = valor;
                else pasada.R_transfor_modificado = valor;
                actualizarPasadas();
            }
        });
    });

    document.querySelectorAll('.btn-reset-param').forEach(btn => { //_j_ botón reset de luz o R
        btn.addEventListener('click', (e) => {
            const idCaja = e.target.dataset.id;
            const param = e.target.dataset.param;
            let pasada = window.pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                if (param === 'luz') delete pasada.Valor_luz_modificado;
                else if (param === 'rtrans') delete pasada.R_transfor_modificado;
                actualizarPasadas();
            }
        });
    });

    document.querySelectorAll('.btn-reset-todo').forEach(btn => { //_j_ botón reset TODO
        btn.addEventListener('click', (e) => {
            const idCaja = e.target.dataset.id;
            let pasada = window.pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                delete pasada.Valor_luz_modificado;
                delete pasada.R_transfor_modificado;
                actualizarPasadas();
            }
        });
    });
}

// ==========================================
// INICIALIZADOR PRINCIPAL (MAIN / DOM)
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Cargar ambos archivos JSON necesarios
        const [respDiametros, respConfig] = await Promise.all([
            fetch('./json/diametros.json'),
            fetch('./json/configuracion.json')
        ]);
        
        diametrosJsonData = await respDiametros.json();
        let datosCrudosConfig = await respConfig.json();
        
        // Normalizar la clave " salida" (con espacio) a "salida" por seguridad
        configuracionJsonData = datosCrudosConfig.map(item => {
            const limpio = { ...item };
            if (' salida' in limpio && !('salida' in limpio)) {
                limpio.salida = limpio[' salida'];
                delete limpio[' salida'];
            }
            return limpio;
        });

        const selectPerfil = document.getElementById('selectPerfil'); //_J_ busca en HTML en atributo id="selectPerfil" y da el valor a selectPerfil
        if (!selectPerfil) return;

        // Limpiar el select por seguridad
        selectPerfil.innerHTML = '<option value="">-- Selecciona Perfil --</option>';

        // Poblar el primer combobox con los perfiles del JSON usando forEach
        configuracionJsonData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.perfil;
            option.textContent = `${item.perfil} mm`;
            selectPerfil.appendChild(option);
        });

        // Escuchar cuando el usuario cambia el perfil
        selectPerfil.addEventListener('change', manejarCambioPerfil); //_J_ va implícito en el select el valor (E), no hace falta dárselo de nuevo

        // Escuchar cambios en los radios de palanquilla
        document.querySelectorAll('input[name="palanquilla"]').forEach(radio => {
            radio.addEventListener('change', () => {
                actualizarPasadas();
            });
        });

        // Foco de pestaña
        window.addEventListener('focus', () => {
            actualizarPasadas();
        });

    } catch (error) {
        console.error("Error al cargar los archivos JSON o inicializar la lámina 4:", error);
    }
});