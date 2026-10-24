/* lamina_5.js */
import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM, relleno_palanquilla } from './cilindro.js'; 
import { simetria, calcularAreaDesdePuntos, aplicarLuz } from './calculos.js'; 
import { graficarCilindroGenerico } from './grafica.js'; 
import { pasadas_55, generarPasadas55 } from './pasadas_copy.js'; 
import { 
    generarPerfilSalidaEkelundZheng2, 
    generarPerfilsalidahinokura3, 
    rotarSalidaAEntrada 
} from './calculo_laminación.js';

const n_puntos = 40;

export function actualizarPasadas() { 
    const contenedor = document.getElementById("contenedor-tablas"); 
    if (!contenedor) return;

    // Guardar la posición del scroll antes de actualizar
    let scrollPos = window.scrollY;

    // 1. Obtener palanquilla seleccionada y área inicial
    let radioSeleccionado = document.querySelector('input[name="palanquilla"]:checked'); 
    let valorPalanquilla = radioSeleccionado ? parseFloat(radioSeleccionado.value) : 150; 
    let rellenocuadrante = relleno_palanquilla(valorPalanquilla, n_puntos); 
    let areaEntradaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);

    contenedor.innerHTML = "";

    const listaPasadas = (typeof generarPasadas55 === 'function' ? generarPasadas55() : null) || window.pasadas_55 || pasadas_55 || [];

    if (listaPasadas.length === 0) {
        contenedor.innerHTML = `<p style="padding: 20px; color: #666;">Selecciona un perfil arriba para comenzar la simulación del tren.</p>`;
        return;
    }

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

        // Convertir los diámetros del JSON (D_min y D_max) a radios de tabla (divididos por 2)
        let min_R_Tabla = p.D_min !== undefined ? p.D_min / 2 : 100; 
        let max_R_Tabla = p.D_max !== undefined ? p.D_max / 2 : 1000; 
        let R_Tabla_original = (max_R_Tabla + min_R_Tabla) / 2; 
        let R_Tabla = p.R_Tabla_modificado !== undefined ? p.R_Tabla_modificado : R_Tabla_original;

        // Generar la geometría del cilindro según el tipo de caja
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
        let areaSalidaTotal;
        let rTransVal;

        // Cálculo físico según el tipo de caja
        if (p.tipo === "AH") {
            let mu = 0.35;
            rellenocuadrante = generarPerfilSalidaEkelundZheng2(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, mu, n_puntos);
            areaSalidaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);
            rTransVal = areaEntradaTotal / areaSalidaTotal;
        } else {
            let alpha = 0.85;
            if (p.nombre !== "BH" && p.nombre !== "CV") {
                rellenocuadrante = rotarSalidaAEntrada(rellenocuadrante);
            }
            rellenocuadrante = generarPerfilsalidahinokura3(perfilCuadrante, rellenocuadrante, luzVal, R_Tabla, alpha, n_puntos);
            areaSalidaTotal = calcularAreaDesdePuntos(rellenocuadrante.X, rellenocuadrante.Y);            
            rTransVal = areaEntradaTotal / areaSalidaTotal;
        }
        
        let rellenoSimetrico = simetria(rellenocuadrante);

        // Crear Tarjeta DOM para la visualización con sus controles de Luz y R
        const card = document.createElement("div");
        card.className = "cilindro-card";
        const canvasId = `canvas_${p.id}`;

        const tipoCilindro = p.tipo || "AH";
        const areaEntradaFmt = areaEntradaTotal.toFixed(2);
        const areaSalidaFmt = areaSalidaTotal.toFixed(2);
        const rTransFmt = rTransVal.toFixed(1);

        card.innerHTML = `
            <h2>${p.nombre} (${p.id})</h2>
            <div class="pasada-content" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                <div class="grafica-container" style="flex: 1; min-width: 300px; max-width: 800px;">
                    <canvas id="${canvasId}"></canvas>
                    
                    <!-- Controles interactivos de Luz y R -->
                    <div style="margin-top: 15px; border-top: 1px solid #dee2e6; padding-top: 10px; background: #fff; padding: 10px; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 0.95em;">Parámetros Ajustables</h4>
                        
                        <!-- Control de Luz -->
                        <div style="margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; font-weight: bold;">Luz (mm): 
                                    <input type="number" class="input-param" data-id="${p.id}" data-param="Valor_luz" value="${luzVal}" step="0.5" 
                                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                                </label>
                            </div>
                            <input type="range" class="slider-param" data-id="${p.id}" data-param="Valor_luz" min="0" max="50" step="0.5" value="${luzVal}" style="width: 100%;">
                        </div>

                        <!-- Control de R_Tabla -->
                        <div style="margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label style="font-size: 0.85em; font-weight: bold;">R_Tabla (mm): 
                                    <input type="number" class="input-param" data-id="${p.id}" data-param="R_Tabla" value="${R_Tabla}" step="1" 
                                           style="width: 70px; padding: 2px 4px; font-size: 0.9em; text-align: right; margin-left: 5px;">
                                </label>
                            </div>
                            <input type="range" class="slider-param" data-id="${p.id}" data-param="R_Tabla" min="${min_R_Tabla}" max="${max_R_Tabla}" step="1" value="${R_Tabla}" style="width: 100%;">
                        </div>

                        <button class="btn-reset-pasada" data-id="${p.id}" style="width: 100%; background-color: #6c757d; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 0.8em; margin-top: 5px;">↺ Restablecer Valores</button>
                    </div>
                </div>

                <div class="datos-pasada-card" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; min-width: 250px;">
                    <h3 style="margin-top: 0; font-size: 1.1em; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Datos de la Pasada</h3>
                    <p><strong>Tipo:</strong> ${tipoCilindro}</p>
                    <p><strong>Área Entrada:</strong> ${areaEntradaFmt} mm²</p>
                    <p><strong>Área Salida:</strong> ${areaSalidaFmt} mm²</p>
                    <p><strong>R. Transformación:</strong> ${rTransFmt}</p>
                    <p><strong>R_Tabla:</strong> ${R_Tabla.toFixed(1)} mm</p>
                </div>
            </div>
        `;

        contenedor.appendChild(card);

        // Acción al hacer clic en la gráfica para abrir el detalle
        const miAccionAlPulsar = () => {
            window.open(`detalle_canal.html?id=${p.id}`, '_blank');
        };
        graficarCilindroGenerico(canvasId, perfilSimetrico, rellenoSimetrico, miAccionAlPulsar);

        // Actualizar el área de entrada acumulada para la siguiente caja en cadena
        areaEntradaTotal = areaSalidaTotal;
    });

    // Vincular eventos de los controles recién creados
    vincularEventosControlesLocales();

    window.scrollTo({ top: scrollPos, behavior: 'instant' });
}

// Función para manejar los sliders e inputs de cada tarjeta
function vincularEventosLocales() {
    // Esta función auxiliar se enmarca dentro de la lógica inferior
}

function vincularEventosControlesLocales() {
    const listaPasadas = (typeof generarPasadas55 === 'function' ? generarPasadas55() : null) || window.pasadas_55 || [];

    // Sincronizar Sliders e Inputs numéricos
    document.querySelectorAll('.slider-param, .input-param').forEach(elemento => {
        elemento.addEventListener('input', (e) => {
            const idCaja = e.target.dataset.id;
            const param = e.target.dataset.param;
            const valor = parseFloat(e.target.value);
            if (isNaN(valor)) return;

            const pasada = listaPasadas.find(item => item.id === idCaja);
            if (pasada) {
                if (param === 'Valor_luz') pasada.Valor_luz_modificado = valor;
                if (param === 'R_Tabla') pasada.R_Tabla_modificado = valor;

                // Actualizar el valor en el control gemelo (slider <-> input)
                document.querySelectorAll(`[data-id="${idCaja}"][data-param="${param}"]`).forEach(el => {
                    el.value = valor;
                });

                // Relanzar el cálculo del tren completo en tiempo real
                actualizarPasadas();
            }
        });
    });

    // Botón de Restablecer por pasada
    document.querySelectorAll('.btn-reset-pasada').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idCaja = e.target.dataset.id;
            const pasada = listaPasadas.find(item => item.id === idCaja);
            if (pasada) {
                delete pasada.Valor_luz_modificado;
                delete pasada.R_Tabla_modificado;
                actualizarPasadas();
            }
        });
    });
}

// Escuchar eventos globales en la interfaz cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[name="palanquilla"]').forEach(radio => {
        radio.addEventListener('change', () => {
            actualizarPasadas();
        });
    });

    document.addEventListener('change', (e) => {
        if (e.target && (e.target.id === 'selectPerfil' || e.target.id === 'selectSalida')) {
            setTimeout(() => {
                actualizarPasadas();
            }, 50);
        }
    });
});