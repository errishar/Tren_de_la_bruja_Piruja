/* lamina.js */


import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM, relleno_palanquilla } from './cilindro.js';
import { simetria, calcularAreaDesdePuntos, aplicarLuz } from './calculos.js';
import { graficarCilindroGenerico } from './grafica.js';
import { pasadas_55, generarPasadas55 } from './pasadas.js';
import { generarPerfilSalidaEkelund, generarPerfilSalidaEkelundZheng, generarPerfilSalidaShinokura ,generarPerfilSalidaShinokura2, generarPerfilSalidaZheng, rotarSalidaAEntrada, generarPerfilSalidaTafelSedlaczek, generarPerfilSalidaKoncevicz } from './calculo_laminación.js';

const n_puntos = 40;

function actualizarPasadas() {
    const contenedor = document.getElementById("contenedor-tablas");
    if (!contenedor) return;

    //_j_ Guardar la posición del scroll antes de actualizar
    let scrollPos = window.scrollY;

    //_j_ 1. Obtener palanquilla seleccionada y área inicial
    let radioSeleccionado = document.querySelector('input[name="palanquilla"]:checked');
    let valorPalanquilla = radioSeleccionado ? parseFloat(radioSeleccionado.value) : 150;
    let rellenocuadrante = relleno_palanquilla(valorPalanquilla, n_puntos);
    let areaEntradaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);

    contenedor.innerHTML = "";

    pasadas_55.forEach((p) => {
        // Dentro del bucle pasadas_55.forEach((p) => { ... }) en lamina_2.js:

        let bVal = p.B_modificado !== undefined ? p.B_modificado : p.B;
        let hVal = p.H_modificado !== undefined ? p.H_modificado : p.H;
        let rVal = p.r_modificado !== undefined ? p.r_modificado : p.r;
        let r1Val = p.R1_modificado !== undefined ? p.R1_modificado : p.R1;
        let r2Val = p.R2_modificado !== undefined ? p.R2_modificado : p.R2;
        let rGenVal = p.R_modificado !== undefined ? p.R_modificado : p.R;
        let aVal = p.a_modificado !== undefined ? p.a_modificado : p.a;
        let nVal = p.n_modificado !== undefined ? p.n_modificado : p.n;
        let luzVal = p.Valor_luz_modificado !== undefined ? p.Valor_luz_modificado : p.Valor_luz;
        let R_nom = p.R_nom !== undefined ? p.R_nom : p.n;

        // Y al generar la geometría pasas estas variables seguras:
        let perfilCuadrante;
        if (p.tipo === "AH") perfilCuadrante = cilindro_AH(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal, aVal);
        else if (p.tipo === "ovalo") perfilCuadrante = cilindro_ovalo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal);
        else if (p.tipo === "redondo") perfilCuadrante = cilindro_redondo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal, aVal || 30);
        else if (p.tipo === "C1") perfilCuadrante = cilindro_C1(nVal || p.n || n_puntos, bVal, hVal, r1Val, r2Val, rVal);
        else if (p.tipo === "RSM") perfilCuadrante = cilindro_RSM(nVal || p.n || n_puntos, bVal, hVal, rGenVal, aVal || 100, nVal || 2);
        
        let perfilConLuz = aplicarLuz(perfilCuadrante, luzVal);
        let perfilSimetrico = simetria(perfilConLuz);
        let areaSalidaTotal ;
        let rTransVal ;
        
        if (p.tipo === "AH") {
            let mu = 0.35;
            /*
            _Ja_ console.log("rellenocuadrante",p.nombre,": ", rellenocuadrante);
            _Ja_ console.log("perfilCuadrante",p.nombre,": ", perfilCuadrante);
            _Ja_ console.log("luzVal",p.nombre,": ", luzVal);
            _Ja_ console.log("R_nom",p.nombre,": ", R_nom);
            _Ja_console.log("mu",p.nombre,": ",mu);
            */
            
            rellenocuadrante = generarPerfilSalidaEkelundZheng(perfilCuadrante, rellenocuadrante, luzVal, R_nom, mu, n_puntos);
            /*
                _M_ rellenocuadrante = generarPerfilSalidaEkelundZheng(perfilCuadrante, rellenocuadrante, luzVal, R_nom, mu, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaShinokura(perfilCuadrante, rellenocuadrante, luzVal, R_nom, alpha, n_puntos);
                _M_ rellenocuadrante =generarPerfilSalidaTafelSedlaczek(perfilCuadrante, rellenocuadrante, luzVal, R_nom, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaKoncevicz(perfilCuadrante, rellenocuadrante, luzVal, R_nom, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaZheng(perfilCilindro, P_in, g, R_nom, m_material = 1.25, gamma = 0.97, maxIter = 3);
            */    
            areaSalidaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);
            rTransVal = areaEntradaTotal/areaSalidaTotal ;
        } else {
            let alpha = 0.85;
            /*
            _Ja_console.log("rellenocuadrante",p.nombre,": ", rellenocuadrante);
            _Ja_console.log("perfilCuadrante",p.nombre,": ", perfilCuadrante);
            _Ja_console.log("luzVal",p.nombre,": ", luzVal);
            _Ja_console.log("R_nom",p.nombre,": ", R_nom);
            _Ja_console.log("alpha",p.nombre,": ",alpha);*/

            if (p.nombre !="BH" && p.nombre !="CV" ){
            rellenocuadrante = rotarSalidaAEntrada(rellenocuadrante);
            }

            rellenocuadrante = generarPerfilSalidaZheng(perfilCuadrante, rellenocuadrante, luzVal, R_nom, 1.25, (p.tipo === "redondo") ? 0.83 : 0.97, 3);
            /* 
                _M_ rellenocuadrante = generarPerfilSalidaShinokura(perfilCuadrante, rellenocuadrante, luzVal, R_nom, alpha, n_puntos);
                _M_ rellenocuadrante =generarPerfilSalidaTafelSedlaczek(perfilCuadrante, rellenocuadrante, luzVal, R_nom, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaKoncevicz(perfilCuadrante, rellenocuadrante, luzVal, R_nom, n_puntos);
                _M_ rellenocuadrante = generarPerfilSalidaZheng(perfilCuadrante, rellenocuadrante, luzVal, R_nom, 1.25, (p.tipo === "redondo") ? 0.83 : 0.97, 3);
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

        const anchomax = (Math.max(...xVals)).toFixed(0);
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

        /* 
        _ja_ const miAccionAlPulsar = () => {//_j_ Cuando pulso sobre la gráfica, me llevaría a una página HTML llamada detalle
        _ja_     window.location.href = `detalle_canal.html?id=${p.id}`;
        _ja_ };
        */
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

function vincularEventosControles() { //_j_ función que recoge los eventos
    document.querySelectorAll('.slider-rtrans, .slider-luz').forEach(slider => {//_j_ deslizamiento del scroll de luz o R
        slider.addEventListener('input', (e) => {
            const idCaja = e.target.dataset.id;
            const valor = parseFloat(e.target.value);
            const esLuz = e.target.classList.contains('slider-luz');
            let pasada = pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                if (esLuz) pasada.Valor_luz_modificado = valor;
                else pasada.R_transfor_modificado = valor;
                actualizarPasadas();
            }
        });
    });

    document.querySelectorAll('.input-rtrans-num, .input-luz-num').forEach(input => {//_j_ entrada de dato de luz en el label o R
        input.addEventListener('change', (e) => {
            const idCaja = e.target.dataset.id;
            let valor = parseFloat(e.target.value);
            const esLuz = e.target.classList.contains('input-luz-num');
            if (isNaN(valor)) return;
            let pasada = pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                if (esLuz) pasada.Valor_luz_modificado = valor;
                else pasada.R_transfor_modificado = valor;
                actualizarPasadas();
            }
        });
    });

    document.querySelectorAll('.btn-reset-param').forEach(btn => {//_j_ botón reset de luz o R
        btn.addEventListener('click', (e) => {
            const idCaja = e.target.dataset.id;
            const param = e.target.dataset.param;
            let pasada = pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                if (param === 'luz') delete pasada.Valor_luz_modificado;
                else if (param === 'rtrans') delete pasada.R_transfor_modificado;
                actualizarPasadas();
            }
        });
    });

    document.querySelectorAll('.btn-reset-todo').forEach(btn => {//_j_ botón reset TODO
        btn.addEventListener('click', (e) => {
            const idCaja = e.target.dataset.id;
            let pasada = pasadas_55.find(p => p.id === idCaja);
            if (pasada) {
                delete pasada.Valor_luz_modificado;
                delete pasada.R_transfor_modificado;
                actualizarPasadas();
            }
        });
    });
}



//_j_ ESTO ES LA FUNCIÓN PRINCIPAL, EL "MAIN" DE TODO

document.addEventListener("DOMContentLoaded", () => {
    generarPasadas55();
    actualizarPasadas();

    document.querySelectorAll('input[name="palanquilla"]').forEach(radio => {
        radio.addEventListener('change', () => {
            generarPasadas55();
            actualizarPasadas();
        });
    });
});