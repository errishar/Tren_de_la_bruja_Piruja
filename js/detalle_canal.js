/* detalle_canal.js */
import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM, relleno_palanquilla } from './cilindro.js';
import { simetria, calcularAreaDesdePuntos, aplicarLuz } from './calculos.js';
import { graficarCilindroGenerico } from './grafica.js';
import { 
    generarPerfilSalidaEkelundZheng2, 
    generarPerfilsalidahinokura3, 
    rotarSalidaAEntrada 
} from './calculo_laminación.js';

const n_puntos = 40;

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idSeleccionado = urlParams.get('id');

    const contenedor = document.getElementById("contenedor-tablas");
    if (!contenedor) return;

    if (!idSeleccionado) {
        contenedor.innerHTML = `<p style="color: red; font-weight: bold;">No se ha especificado ninguna caja en la URL.</p>`;
        return;
    }

    try {
        // Cargar directamente diametros.json para encontrar la caja de forma independiente
        const respDiametros = await fetch('./json/diametros.json');
        const diametrosJson = await respDiametros.json();

        let matchCaja = diametrosJson.find(c => {
            let idLimpio = c.id.toString().toUpperCase().replace('C', '');
            let selLimpio = idSeleccionado.toString().toUpperCase().replace('C', '');
            return idLimpio === selLimpio || c.id.toString() === idSeleccionado.toString();
        });

        let p = null;
        if (matchCaja) {
            const perfilBase = matchCaja.perfiles ? matchCaja.perfiles[0] : matchCaja;
            p = {
                id: matchCaja.id.startsWith('C') ? matchCaja.id : `C${matchCaja.id}`,
                nombre: matchCaja.nombre || idSeleccionado,
                tipo: matchCaja.tipo || "AH",
                D_max: matchCaja.D_max,
                D_min: matchCaja.D_min,
                ...perfilBase,
                Valor_luz: 10
            };
        } else {
            p = {
                id: idSeleccionado,
                nombre: idSeleccionado,
                tipo: idSeleccionado.includes('AH') ? 'AH' : 'ovalo',
                B: 200, H: 40, R: 150, r: 10, a: 0, n: n_puntos,
                D_max: 750, D_min: 650,
                Valor_luz: 10
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
        contenedor.innerHTML = `<p style="color: red; font-weight: bold;">Error al cargar los datos de la caja ${idSeleccionado}.</p>`;
    }
});

function renderizarPagina(p, contenedor) {
    contenedor.innerHTML = "";

    let luzVal = p.Valor_luz_modificado !== undefined ? p.Valor_luz_modificado : (p.Valor_luz || 10);
    let rellenocuadrante = relleno_palanquilla(150, n_puntos);

    let bVal = p.B_modificado !== undefined ? p.B_modificado : p.B;
    let hVal = p.H_modificado !== undefined ? p.H_modificado : p.H;
    let rVal = p.r_modificado !== undefined ? p.r_modificado : p.r;
    let r1Val = p.R1_modificado !== undefined ? p.R1_modificado : p.R1;
    let r2Val = p.R2_modificado !== undefined ? p.R2_modificado : p.R2;
    let rGenVal = p.R_modificado !== undefined ? p.R_modificado : p.R;
    let aVal = p.a_modificado !== undefined ? p.a_modificado : p.a;
    let nVal = p.n_modificado !== undefined ? p.n_modificado : p.n;

    // Configuración de Diámetro de Tabla (D_max y D_min) con posición intermedia por defecto
    let min_R_Tabla = p.D_min !== undefined ? p.D_min : (p.R_Tabla_min !== undefined ? p.R_Tabla_min : 100);
    let max_R_Tabla = p.D_max !== undefined ? p.D_max : (p.R_Tabla_max !== undefined ? p.R_Tabla_max : 1000);
    let R_Tabla_original = (max_R_Tabla + min_R_Tabla) / 2;
    let R_Tabla = p.R_Tabla_modificado !== undefined ? p.R_Tabla_modificado : R_Tabla_original;

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

    let rellenoSimetrico = simetria(rellenocuadrante);

    const card = document.createElement("div");
    card.className = "cilindro-card";
    const canvasId = `canvas_detalle_${p.id}`;

    // Construcción de la tabla lateral con los datos de diseño y el slider de Diámetro de Tabla
    let filasTablaHTML = `
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">Caja:</td><td style="padding: 6px 0; text-align: right;">${p.id}</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">Tipo:</td><td style="padding: 6px 0; text-align: right;">${p.tipo}</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">B (Ancho):</td><td style="padding: 6px 0; text-align: right;">${bVal} mm</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">H (Alto):</td><td style="padding: 6px 0; text-align: right;">${hVal} mm</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">Radio (R / R1):</td><td style="padding: 6px 0; text-align: right;">${r1Val !== undefined ? r1Val : (rGenVal !== undefined ? rGenVal : '-')} mm</td></tr>
        <tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 6px 0; font-weight: bold;">r (Radio Esq):</td><td style="padding: 6px 0; text-align: right;">${rVal !== undefined ? rVal : '-'} mm</td></tr>
    `;

    let controlesHTML = generarHTMLControles(p);

    card.innerHTML = `
        <div style="margin-bottom: 15px;">
            <button class="btn-volver" style="padding: 6px 12px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar Pestaña</button>
        </div>
        <h2>Modificación de la canal: ${p.nombre} (${p.id})</h2>
        <div class="pasada-content" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            <div class="grafica-container" style="flex: 1; min-width: 300px; max-width: 800px;">
                <canvas id="${canvasId}"></canvas>
                <div style="margin-top: 15px; border-top: 1px solid #dee2e6; padding-top: 10px;">
                    <h4 style="margin: 5px 0 10px 0; color: #333;">Parámetros de Diseño de la Canal</h4>
                    ${controlesHTML}
                    <button class="btn-reset-todo" data-id="${p.id}" style="width: 100%; background-color: #6c757d; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-top: 10px;">↺ Restablecer Valores Originales</button>
                </div>
            </div>
            <div class="datos-pasada-card" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; min-width: 280px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 1.1em; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Datos de la Caja</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.95em; margin-bottom: 15px;">
                    <tbody>
                        ${filasTablaHTML}
                    </tbody>
                </table>
                
                <!-- Slider de Diámetro de Tabla con rango D_min y D_max -->
                <div style="border-top: 1px solid #dee2e6; padding-top: 10px;">
                    <label style="font-size: 0.85em; font-weight: bold; display: block; margin-bottom: 5px;">Diámetro de Tabla:</label>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <input type="number" class="input-param" data-param="R_Tabla" value="${R_Tabla}" step="0.5" 
                               style="width: 80px; padding: 2px 4px; font-size: 0.9em; text-align: right;">
                        <span style="font-size: 0.85em; font-weight: bold;">mm</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #666;">
                        <span>Min: ${min_R_Tabla}</span>
                        <input type="range" class="slider-param" data-param="R_Tabla" min="${min_R_Tabla}" max="${max_R_Tabla}" step="0.5" value="${R_Tabla}" style="flex: 1;">
                        <span>Max: ${max_R_Tabla}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    contenedor.appendChild(card);
    graficarCilindroGenerico(canvasId, perfilSimetrico, rellenoSimetrico, () => {});
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

    if (p.tipo === "AH") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio Sup)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
        html += crearControl("a (Ángulo)", "a", p.a_modificado ?? p.a, 0, 60, 1);
    } else if (p.tipo === "ovalo") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
    } else if (p.tipo === "redondo") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
        html += crearControl("a (Ángulo)", "a", p.a_modificado ?? p.a, 0, 60, 1);
    } else if (p.tipo === "C1") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R1 (Radio 1)", "R1", p.R1_modificado ?? p.R1, (p.R1 || 50) * 0.5, (p.R1 || 50) * 1.5, 1);
        html += crearControl("R2 (Radio 2)", "R2", p.R2_modificado ?? p.R2, (p.R2 || 50) * 0.5, (p.R2 || 50) * 1.5, 1);
        html += crearControl("r (Radio Esq)", "r", p.r_modificado ?? p.r, 1, (p.r || 5) * 2, 0.5);
    } else if (p.tipo === "RSM") {
        html += crearControl("B (Ancho)", "B", p.B_modificado ?? p.B, (p.B || 100) * 0.5, (p.B || 100) * 1.5, 0.5);
        html += crearControl("H (Alto)", "H", p.H_modificado ?? p.H, (p.H || 30) * 0.5, (p.H || 30) * 1.5, 0.5);
        html += crearControl("R (Radio)", "R", p.R_modificado ?? p.R, (p.R || 50) * 0.5, (p.R || 50) * 1.5, 1);
        html += crearControl("a (Ángulo)", "a", p.a_modificado ?? p.a, 0, 180, 1);
    }
    return html;
}

function vincularEventosParametros(p, contenedor) {
    contenedor.querySelectorAll('.slider-param, .input-param').forEach(elemento => {
        elemento.addEventListener('input', (e) => {
            const param = e.target.dataset.param;
            let valor = parseFloat(e.target.value);
            if (isNaN(valor)) return;

            if (param === 'B') p.B_modificado = valor;
            else if (param === 'H') p.H_modificado = valor;
            else if (param === 'R') p.R_modificado = valor;
            else if (param === 'r') p.r_modificado = valor;
            else if (param === 'a') p.a_modificado = valor;
            else if (param === 'R1') p.R1_modificado = valor;
            else if (param === 'R2') p.R2_modificado = valor;
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
            delete p.B_modificado;
            delete p.H_modificado;
            delete p.R_modificado;
            delete p.r_modificado;
            delete p.a_modificado;
            delete p.R1_modificado;
            delete p.R2_modificado;
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
        R_Tabla_modificado: p.R_Tabla_modificado
    };
    localStorage.setItem(`pasada_${p.id}`, JSON.stringify(datosModificados));
}