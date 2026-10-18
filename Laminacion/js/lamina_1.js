/* lamina.js */

import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM } from './cilindro.js';
import { aplicarLuz, simetria, truncarRelleno, calcular_X } from './calculos.js';
import { graficarCilindroGenerico } from './grafica.js';
import { pasadas_55, generarPasadas55 } from './pasadas.js';

const n_puntos = 40;

function actualizarPasadas() {
    const contenedor = document.getElementById("contenedor-tablas");
    if (!contenedor) return;

    // 1. Obtener palanquilla seleccionada y área inicial
    const radioSeleccionado = document.querySelector('input[name="palanquilla"]:checked');
    const valorPalanquilla = radioSeleccionado ? parseFloat(radioSeleccionado.value) : 150;
    let areaEntradaActual = Math.pow(valorPalanquilla, 2) / 4;
  

    const scrollPos = window.scrollY;
    contenedor.innerHTML = "";

    pasadas_55.forEach((p) => {
        let rTransVal = p.R_transfor_modificado !== undefined ? p.R_transfor_modificado : p.R_transfor;
        let luzVal = p.Valor_luz_modificado !== undefined ? p.Valor_luz_modificado : p.Valor_luz;
        
        let areaEntradaPaseCuadrante = areaEntradaActual;
        let areaSalidaPaseCuadrante = areaEntradaPaseCuadrante / rTransVal;

        let areaEntradaTotal = areaEntradaPaseCuadrante * 4;
        let areaSalidaTotal = areaSalidaPaseCuadrante * 4;

        // Generar Geometría del perfil según p.tipo
        let perfilCuadrante;
        if (p.tipo === "AH") perfilCuadrante = cilindro_AH(p.n || n_puntos, p.B, p.H, p.R, p.r, p.a);
        else if (p.tipo === "ovalo") perfilCuadrante = cilindro_ovalo(p.n || n_puntos, p.B, p.H, p.R, p.r);
        else if (p.tipo === "redondo") perfilCuadrante = cilindro_redondo(p.n || n_puntos, p.B, p.H, p.R, p.r, p.a || 30);
        else if (p.tipo === "C1") perfilCuadrante = cilindro_C1(p.n || n_puntos, p.B, p.H, p.R1, p.R2, p.r);
        else if (p.tipo === "RSM") perfilCuadrante = cilindro_RSM(p.n || n_puntos, p.B, p.H, p.R, p.a || 100, p.z || 2);
        else perfilCuadrante = cilindro_ovalo(p.n || n_puntos, p.B, p.H, p.R, p.r);

        let perfilConLuz = aplicarLuz(perfilCuadrante, luzVal);
        let perfilSimetrico = simetria(perfilConLuz);

        
 
        let x_corte = calcular_X(perfilConLuz, areaSalidaPaseCuadrante);
        let rellenocuadrante = truncarRelleno(perfilConLuz, x_corte);
        
   
        
        let rellenoSimetrico = simetria(rellenocuadrante);

        // Crear Tarjeta DOM
        const card = document.createElement("div");
        card.className = "cilindro-card";
        const canvasId = `canvas_${p.id}`;

        const tipoCilindro = p.tipo || "AH";
        const areaEntradaFmt = areaEntradaTotal.toFixed(2);
        const areaSalidaFmt = areaSalidaTotal.toFixed(2);
        const rTransFmt = rTransVal.toFixed(2);

        const xVals = (rellenocuadrante && rellenocuadrante.X && rellenocuadrante.X.length > 0) ? rellenocuadrante.X : [0];
        const yVals = (rellenocuadrante && rellenocuadrante.Y && rellenocuadrante.Y.length > 0) ? rellenocuadrante.Y : [0];

        const anchomax = (Math.max(...xVals) * 2).toFixed(2);
        const altomax = (Math.max(...yVals) * 2).toFixed(2);

        card.innerHTML = `
            <h2>${p.nombre}</h2>
            <div class="pasada-content" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                <div class="grafica-container" style="flex: 1; min-width: 300px; max-width: 800px;">
                    <canvas id="${canvasId}"></canvas>
                    
                    <div style="margin-top: 15px; border-top: 1px solid #dee2e6; padding-top: 10px;">
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; font-weight: bold;">R. Transformación: 
                                    <input type="number" class="input-rtrans-num" data-id="${p.id}" value="${rTransFmt}" step="0.01" 
                                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                                </label>
                                <button class="btn-reset-param" data-id="${p.id}" data-param="rtrans" style="background: none; border: none; color: #007bff; cursor: pointer; font-size: 0.8em;">↺ Reset R.T.</button>
                            </div>
                            <input type="range" class="slider-rtrans" data-id="${p.id}" min="0.5" max="2.5" step="0.01" value="${rTransVal}" style="width: 100%;">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; font-weight: bold;">Luz (mm): 
                                    <input type="number" class="input-luz-num" data-id="${p.id}" value="${luzVal}" step="0.1" 
                                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                                </label>
                                <button class="btn-reset-param" data-id="${p.id}" data-param="luz" style="background: none; border: none; color: #007bff; cursor: pointer; font-size: 0.8em;">↺ Reset Luz</button>
                            </div>
                            <input type="range" class="slider-luz" data-id="${p.id}" min="0" max="30" step="0.1" value="${luzVal}" style="width: 100%;">
                        </div>
                        <button class="btn-reset-todo" data-id="${p.id}" style="width: 100%; background-color: #6c757d; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-top: 5px;">↺ Restablecer Todo</button>
                    </div>
                </div>

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
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${rTransFmt}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 6px 0; font-weight: bold; color: #495057;">Luz:</td>
                                <td style="padding: 6px 0; text-align: right; color: #212529;">${luzVal} mm</td>
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

        // Definición del evento al pulsar sobre la gráfica
        const miAccionAlPulsar = () => {
            window.location.href = `detalle.html?id=${p.id}`;
        };

        // Renderizar la gráfica pasando la acción de clic
        graficarCilindroGenerico(canvasId, perfilSimetrico, rellenoSimetrico, miAccionAlPulsar);

        areaEntradaActual = areaSalidaPaseCuadrante;
    });

    vincularEventosControles();
    window.scrollTo({ top: scrollPos, behavior: 'instant' });
}

function vincularEventosControles() {
    document.querySelectorAll('.slider-rtrans, .slider-luz').forEach(slider => {
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

    document.querySelectorAll('.input-rtrans-num, .input-luz-num').forEach(input => {
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

    document.querySelectorAll('.btn-reset-param').forEach(btn => {
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

    document.querySelectorAll('.btn-reset-todo').forEach(btn => {
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