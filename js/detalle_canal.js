/* detalle_canal.js */

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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Cargar los JSON necesarios igual que en lamina_4.js
        const [respDiametros, respConfig] = await Promise.all([
            fetch('./json/diametros.json'),
            fetch('./json/configuracion.json')
        ]);
        
        const diametrosJsonData = await respDiametros.json();
        let datosCrudosConfig = await respConfig.json();
        
        const configuracionJsonData = datosCrudosConfig.map(item => {
            const limpio = { ...item };
            if (' salida' in limpio && !('salida' in limpio)) {
                limpio.salida = limpio[' salida'];
                delete limpio[' salida'];
            }
            return limpio;
        });

        const urlParams = new URLSearchParams(window.location.search);
        const idSeleccionado = urlParams.get('id');

        const contenedor = document.getElementById("contenedor-tablas");
        if (!contenedor) return;

        if (!idSeleccionado) {
            contenedor.innerHTML = `<p style="color: red; font-weight: bold;">No se ha especificado ninguna caja en la URL.</p>`;
            return;
        }

        // 2. Buscar la caja en la lista plana de diametros.json o en la configuración
        let p = null;
        const matchCaja = diametrosJsonData.find(c => {
            let idLimpio = c.id.toString().replace('C', '');
            let idSelLimpio = idSeleccionado.toString().replace('C', '');
            return idLimpio === idSelLimpio || c.id === idSeleccionado;
        });

        if (matchCaja) {
            // Si tiene perfiles, tomamos el primero por defecto o adaptamos
            const perfilBase = matchCaja.perfiles ? matchCaja.perfiles[0] : matchCaja;
            p = {
                id: matchCaja.id.startsWith('C') ? matchCaja.id : `C${matchCaja.id}`,
                nombre: matchCaja.nombre || idSeleccionado,
                tipo: matchCaja.tipo || "ovalo",
                ...perfilBase,
                Valor_luz: 10,
                R_transfor: 1.2
            };
        } else {
            // Fallo alternativo buscando por nombre exacto
            p = {
                id: idSeleccionado,
                nombre: idSeleccionado,
                tipo: "AH",
                B: 200, H: 40, R: 150, r: 10, a: 0, n: n_puntos,
                Valor_luz: 10, R_transfor: 1.2
            };
        }

        // Recuperar modificaciones previas de localStorage si existen
        const guardado = localStorage.getItem(`pasada_${p.id}`);
        if (guardado) {
            const mods = JSON.parse(guardado);
            Object.assign(p, mods);
        }

        renderizarPagina(p, contenedor);

    } catch (error) {
        console.error("Error al cargar los datos en detalle_canal:", error);
    }
});

function renderizarPagina(p, contenedor) {
    contenedor.innerHTML = "";

    // Obtener valores actuales (modificados o originales)
    let luzVal = p.Valor_luz_modificado !== undefined ? p.Valor_luz_modificado : (p.Valor_luz || 10);
    
    let rellenocuadrante = relleno_palanquilla(150, n_puntos);
    let areaEntradaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);
    let areaSalidaTotal;

    // Obtener parámetros de diseño con seguridad ante valores no modificados
    let bVal = p.B_modificado !== undefined ? p.B_modificado : p.B;
    let hVal = p.H_modificado !== undefined ? p.H_modificado : p.H;
    let rVal = p.r_modificado !== undefined ? p.r_modificado : p.r;
    let r1Val = p.R1_modificado !== undefined ? p.R1_modificado : p.R1;
    let r2Val = p.R2_modificado !== undefined ? p.R2_modificado : p.R2;
    let rGenVal = p.R_modificado !== undefined ? p.R_modificado : p.R;
    let aVal = p.a_modificado !== undefined ? p.a_modificado : p.a;
    let nVal = p.n_modificado !== undefined ? p.n_modificado : p.n;
    let R_Tabla_min = p.R_Tabla_min !== undefined ? p.R_Tabla_min : 100;
    let R_Tabla_max = p.R_Tabla_max !== undefined ? p.R_Tabla_max : 1000;
    let R_Tabla_original = (R_Tabla_max + R_Tabla_min)/2;
    let R_Tabla = p.R_Tabla_modificado !== undefined ? p.R_Tabla_modificado : R_Tabla_original ;

    // Generar geometría del perfil según el tipo de canal
    let perfilCuadrante;
    if (p.tipo === "AH") {
        perfilCuadrante = cilindro_AH(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal, aVal);
    } else if (p.tipo === "ovalo") {
        perfilCuadrante = cilindro_ovalo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal);
    } else if (p.tipo === "redondo") {
        perfilCuadrante = cilindro_redondo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal, aVal || 30);
    } else if (p.tipo === "C1") {
        perfilCuadrante = cilindro_C1(nVal || p.n || n_puntos, bVal, hVal, r1Val, r2Val, rVal);
    } else if (p.tipo === "RSM") {
        perfilCuadrante = cilindro_RSM(nVal || p.n || n_puntos, bVal, hVal, rGenVal, aVal || 100, nVal || 2);
    } else {
        perfilCuadrante = cilindro_ovalo(nVal || p.n || n_puntos, bVal, hVal, rGenVal, rVal);
    }

    let perfilConLuz = aplicarLuz(perfilCuadrante, luzVal);
    let perfilSimetrico = simetria(perfilConLuz);

    if (p.tipo === "AH") {
        let mu = 0.35;
        rellenocuadrante = generarPerfilSalidaEkelundZheng2(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, mu, n_puntos);
    } else {
        if (p.nombre !== "BH" && p.nombre !== "CV") {
            rellenocuadrante = rotarSalidaAEntrada(rellenocuadrante);
        }
        rellenocuadrante = generarPerfilsalidahinokura3(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, 0.85, n_puntos);
    }

    areaSalidaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);
    let rellenoSimetrico = simetria(rellenocuadrante);

    const card = document.createElement("div");
    card.className = "cilindro-card";
    const canvasId = `canvas_detalle_${p.id}`;

    const xVals = (rellenoSimetrico && rellenoSimetrico.X_sup && rellenoSimetrico.X_sup.length > 0) ? rellenoSimetrico.X_sup : [0];
    const yVals = (rellenoSimetrico && rellenoSimetrico.Y_sup && rellenoSimetrico.Y_sup.length > 0) ? rellenoSimetrico.Y_sup : [0];
    const anchomax = (Math.max(...xVals)).toFixed(0);
    const altomax = (Math.max(...yVals) * 2).toFixed(0);

    let filasTablaHTML = `
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">Caja:</td><td style="padding: 6px 0; text-align: right;">${p.id}</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">B:</td><td style="padding: 6px 0; text-align: right;">${bVal.toFixed(2)} (${(p.B || 0).toFixed(2)}) mm</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">H:</td><td style="padding: 6px 0; text-align: right;">${hVal.toFixed(2)} (${(p.H || 0).toFixed(2)}) mm</td></tr>
    `;

    if (p.tipo === "C1") {
        filasTablaHTML += ` 
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">R1:</td><td style="padding: 6px 0; text-align: right;">${r1Val.toFixed(2)} (${(p.R1 || 0).toFixed(2)}) mm</td></tr>
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">R2:</td><td style="padding: 6px 0; text-align: right;">${r2Val.toFixed(2)} (${(p.R2 || 0).toFixed(2)}) mm</td></tr>
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">r:</td><td style="padding: 6px 0; text-align: right;">${rVal.toFixed(2)} (${(p.r || 0).toFixed(2)}) mm</td></tr>
        `;
    } else if (p.tipo === "RSM") {
        filasTablaHTML += `
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">R:</td><td style="padding: 6px 0; text-align: right;">${rGenVal.toFixed(2)} (${(p.R || 0).toFixed(2)}) mm</td></tr>
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">n:</td><td style="padding: 6px 0; text-align: right;">${nVal.toFixed(2)} (${(p.n || 0).toFixed(2)})</td></tr>
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">a:</td><td style="padding: 6px 0; text-align: right;">${aVal.toFixed(2)} (${(p.a || 0).toFixed(2)})°</td></tr>
        `;
    } else {
        filasTablaHTML += `
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">R:</td><td style="padding: 6px 0; text-align: right;">${rGenVal.toFixed(2)} (${(p.R || 0).toFixed(2)}) mm</td></tr>
            <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">r:</td><td style="padding: 6px 0; text-align: right;">${rVal.toFixed(2)} (${(p.r || 0).toFixed(2)}) mm</td></tr>
        `;
        if (p.tipo !== "ovalo") {
            filasTablaHTML += `<tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">a:</td><td style="padding: 6px 0; text-align: right;">${aVal.toFixed(2)} (${(p.a || 0).toFixed(2)})°</td></tr>`;
        }
    }
    
    filasTablaHTML += `<tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">R_Tabla:</td><td style="padding: 6px 0; text-align: right;">${R_Tabla.toFixed(2)} (${R_Tabla_original.toFixed(2)}) mm</td></tr>`;

    let controlesHTML = generarHTMLControles(p);

    card.innerHTML = `
        <div style="margin-bottom: 15px;">
            <button class="btn-volver" style="padding: 6px 12px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar Pestaña</button>
        </div>
        <h2>Caja: ${p.nombre} (${p.id}) - Tipo: ${p.tipo}</h2>
        <div class="pasada-content" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            <div class="grafica-container" style="flex: 1; min-width: 300px; max-width: 800px;">
                <canvas id="${canvasId}"></canvas>
                <div style="margin-top: 15px; border-top: 1px solid #dee2e6; padding-top: 10px;">
                    <h4 style="margin: 5px 0 10px 0; color: #333;">Parámetros de Diseño de la Canal</h4>
                    ${controlesHTML}
                    <button class="btn-reset-todo" data-id="${p.id}" style="width: 100%; background-color: #6c757d; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-top: 10px;">↺ Restablecer Valores Originales</button>
                </div>
            </div>
            <div class="datos-pasada-card" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; min-width: 250px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 1.1em; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Datos de la Pasada</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.95em;">
                    <tbody>
                        ${filasTablaHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    contenedor.appendChild(card);
    
    graficarCilindroGenerico(canvasId, perfilSimetrico, null);
    vincularEventosParametros(p, contenedor);
}

function generarHTMLControles(p) {
    let html = '';

    const crearControl = (label, key, val, min, max, step) => `
        <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-size: 0.85em; font-weight: bold;">${label}: 
                    <input type="number" class="input-param" data-param="${key}" value="${val}" step="${step}" 
                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                </label>
            </div>
            <input type="range" class="slider-param" data-param="${key}" min="${min}" max="${max}" step="${step}" value="${val}" style="width: 100%;">
        </div>
    `;

    let minR = p.R_Tabla_min !== undefined ? p.R_Tabla_min : 100;
    let maxR = p.R_Tabla_max !== undefined ? p.R_Tabla_max : 1000;
    let rOrig = (maxR + minR) / 2;
    let rValTabla = p.R_Tabla_modificado !== undefined ? p.R_Tabla_modificado : rOrig;

    if (p.tipo === "AH") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio Sup)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
        html += crearControl("a (Ángulo)", "a", p.a_modificado ?? p.a, 0, 60, 1);
        html += crearControl("R_Tabla (Tabla de cilindro)", "R_Tabla", rValTabla, minR, maxR, 1);
    } else if (p.tipo === "ovalo") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
        html += crearControl("R_Tabla (Tabla de cilindro)", "R_Tabla", rValTabla, minR, maxR, 1);
    } else {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
        html += crearControl("R_Tabla (Tabla de cilindro)", "R_Tabla", rValTabla, minR, maxR, 1);
    }

    return html;
}

function vincularEventosParametros(p, contenedor) {
    contenedor.querySelectorAll('.slider-param, .input-param').forEach(elemento => {
        elemento.addEventListener('input', (e) => {
            const param = e.target.dataset.param;
            let valor = parseFloat(e.target.value);
            if (isNaN(valor)) return;

            if (param === 'Valor_luz') p.Valor_luz_modificado = valor;
            else if (param === 'B') p.B_modificado = valor;
            else if (param === 'H') p.H_modificado = valor;
            else if (param === 'R') p.R_modificado = valor;
            else if (param === 'r') p.r_modificado = valor;
            else if (param === 'a') p.a_modificado = valor;
            else if (param === 'R1') p.R1_modificado = valor;
            else if (param === 'R2') p.R2_modificado = valor;
            else if (param === 'n') p.n_modificado = valor;
            else if (param === 'R_Tabla') p.R_Tabla_modificado = valor;

            contenedor.querySelectorAll(`[data-param="${param}"]`).forEach(el => {
                el.value = valor;
            });

            guardarModificacionesEnStorage(p);
            renderizarPagina(p, contenedor);
        });
    });

    const btnReset = contenedor.querySelector('.btn-reset-todo');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            delete p.Valor_luz_modificado;
            delete p.B_modificado;
            delete p.H_modificado;
            delete p.R_modificado;
            delete p.r_modificado;
            delete p.a_modificado;
            delete p.R1_modificado;
            delete p.R2_modificado;
            delete p.n_modificado;
            delete p.R_Tabla_modificado;

            localStorage.removeItem(`pasada_${p.id}`);
            renderizarPagina(p, contenedor);
        });
    }

    const btnVolver = contenedor.querySelector('.btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.close();
        });
    }
}

function guardarModificacionesEnStorage(p) {
    const datosModificados = {
        B_modificado: p.B_modificado,
        H_modificado: p.H_modificado,
        R_modificado: p.R_modificado,
        r_modificado: p.r_modificado,
        a_modificado: p.a_modificado,
        R1_modificado: p.R1_modificado,
        R2_modificado: p.R2_modificado,
        n_modificado: p.n_modificado,
        Valor_luz_modificado: p.Valor_luz_modificado,
        R_Tabla_modificado: p.R_Tabla_modificado,
    };
    localStorage.setItem(`pasada_${p.id}`, JSON.stringify(datosModificados));
}