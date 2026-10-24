/* calculo_laminación.js */
import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM } from './cilindro.js';
import { aplicarLuz, simetria, truncarRelleno, calcular_X, interpolarY, calcularAreaDesdePuntos, crearFuncionAltura, trunc, linespace } from './calculos.js';

/** 
 * Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 */
export function generarPerfilSalidaEkelund(perfilCilindro, P_in, g, R_tabla, mu = 0.35, n_puntos_libre = 25) {
    console.log("R de tabla:" , R_tabla);
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    const obtenerAlturaEn = function(x) {
        let x_abs = Math.abs(x);
        if (x_abs > half_W0) return 0;
        
        for (let i = 0; i < X_in.length - 1; i++) {
            if (x_abs >= X_in[i] && x_abs <= X_in[i + 1]) {
                let t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i]);
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]));
            }
        }
        return 2 * Y_in[Y_in.length - 1];
    };

    let X_dh = [];
    let Y_dh = [];
    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;

        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        
        X_dh.push(x);
        Y_dh.push(dh);

        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);

    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const h1_eq = H0_eq - dH_eq;
    const half_W_canal_max = Math.max(...X_c);
    
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_tabla - y_c_media; 

    let divisor_h = H0_eq + h1_eq;
    let m_eq = divisor_h > 0 ? (1.6 * mu * Math.sqrt(R_eff * dH_eq)) / divisor_h : 0;

    let numerador = m_eq * dH_eq * Math.sqrt(R_eff * dH_eq);
    let denominador = H0_eq + m_eq * h1_eq;
    let delta_b = denominador > 0 ? (numerador / denominador) : 0;

    const W1 = W0 + delta_b/2;
    const half_W1_calculado = W1 / 2;
    const half_W1 = Math.min(half_W1_calculado, half_W_canal_max);

    let X_out = [];
    let Y_out = [];

    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    if (half_W1 > x_cont) {
        let dx_libre = (half_W1 - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W1 - x_cont);
            let y = y_cont - (y_cont - half_g) * Math.pow(t, 2);

            X_out.push(x);
            Y_out.push(y);
        }
    }

    X_out = X_out.map(x => trunc(x, 2));
    Y_out = Y_out.map(y => trunc(y, 2));

    return { X: X_out, Y: Y_out };
}

/**
 * Calcula el ensanchamiento lateral (Δb) utilizando el modelo iterativo de Zheng et al. (2010)
 */
export function calcularSpreadZhengIterativo(W0, H0, A0, Ah, R_tabla, m_material = 1.28, maxIter = 5) {
    console.log("R de tabla:" , R_tabla);
    let delta_b = 0;
    let Hm_eq = H0 * 0.75; 
    let R_eff = R_tabla;    

    for (let i = 0; i < maxIter; i++) {
        let gamma = 1.0; 
        let term_raiz = Math.sqrt(R_eff * Math.max(0, H0 - Hm_eq));
        let denominador = W0 + 0.5 * H0;
        
        if (denominador <= 0) break;

        let delta_b_nuevo = m_material * gamma * (term_raiz / denominador) * (Ah / A0) * W0;

        if (Math.abs(delta_b_nuevo - delta_b) < 0.01 && i > 0) {
            delta_b = delta_b_nuevo;
            break;
        }

        delta_b = delta_b_nuevo;
        let W_actual = W0 + delta_b;
        Hm_eq = Ah / W_actual; 
        R_eff = R_tabla - (H0 - Hm_eq) * 0.1; 
    }

    return delta_b;
}

/** 
 * Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund-Zheng.
 */
export function generarPerfilSalidaEkelundZheng(perfilCilindro, P_in, g, R_tabla, mu = 0.35, n_puntos_libre = 25) {
    console.log("R de tabla:" , R_tabla);
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    const obtenerAlturaEn = function(x) {
        let x_abs = Math.abs(x);
        if (x_abs > half_W0) return 0;
        
        for (let i = 0; i < X_in.length - 1; i++) {
            if (x_abs >= X_in[i] && x_abs <= X_in[i + 1]) {
                let t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i]);
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]));
            }
        }
        return 2 * Y_in[Y_in.length - 1];
    };

    let X_dh = [];
    let Y_dh = [];
    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;

        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        
        X_dh.push(x);
        Y_dh.push(dh);

        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const h1_eq = H0_eq - dH_eq;
    
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_tabla - y_c_media; 

    let delta_b = calcularSpreadZhengIterativo(W0, H0_eq * 2, A0, Ah, R_tabla, 1.28, 5);

    const half_W_canal_max = Math.max(...X_c);
    const half_W1_calculado = (W0 + delta_b) / 2;
    const half_W1 = Math.min(half_W1_calculado, half_W_canal_max);

    let X_out = [];
    let Y_out = [];

    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    if (half_W1 > x_cont) {
        let dx_libre = (half_W1 - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W1 - x_cont);
            let y = y_cont - (y_cont - half_g) * Math.pow(t, 2);

            X_out.push(x);
            Y_out.push(y);
        }
    }

    X_out = X_out.map(x => trunc(x, 2));
    Y_out = Y_out.map(y => trunc(y, 2));

    return { X: X_out, Y: Y_out };
}

/** 
 * Generar perfil de salida Ekelund-Zheng optimizado (Versión 2)
 */
export function generarPerfilSalidaEkelundZheng2(perfilCilindro, P_in, g, R_tabla, mu = 0.35, n_puntos_libre = 25) {
    console.log("R de tabla:" , R_tabla);
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    const obtenerAlturaEn = function(x) {
        let x_abs = Math.abs(x);
        if (x_abs > half_W0) return 0;
        for (let i = 0; i < X_in.length - 1; i++) {
            if (x_abs >= X_in[i] && x_abs <= X_in[i + 1]) {
                let t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i]);
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]));
            }
        }
        return 2 * Y_in[Y_in.length - 1];
    };

    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;
    let Ah = 0;

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;
        
        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        
        if (i > 0) {
            let dx = X_c[i] - X_c[i - 1];
            Ah += dh * dx;
        }
        
        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }
    
    Ah = Ah * 2; 

    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const h1_eq = Math.max(0.1, H0_eq - dH_eq); 
    
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_tabla - y_c_media; 
    
    const m_eq = (1.6 * mu * Math.sqrt(R_eff * dH_eq)) / (H0_eq + h1_eq);
    
    let numerador = m_eq * dH_eq * Math.sqrt(R_eff * dH_eq);
    let denominador = H0_eq + m_eq * h1_eq;
    let delta_b = denominador > 0 ? (numerador / denominador) : 0;

    const half_W_canal_max = Math.max(...X_c);
    const half_W1_calculado = (W0 + delta_b) / 2;
    const half_W1 = Math.min(half_W1_calculado, half_W_canal_max);

    let X_out = [];
    let Y_out = [];

    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    if (half_W1 > x_cont) {
        let dx_libre = (half_W1 - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W1 - x_cont);
            
            let y_parabola = y_cont - (y_cont - half_g) * Math.pow(t, 2);
            let y_canal_max = interpolarY({ X: X_c, Y: Y_luz }, x);
            let y_final = Math.min(y_parabola, y_canal_max);
            y_final = Math.max(half_g, y_final);

            X_out.push(x);
            Y_out.push(y_final);
        }
    }

    X_out = X_out.map(x => trunc(x, 2));
    Y_out = Y_out.map(y => trunc(y, 2));

    return { X: X_out, Y: Y_out };
}

/**
 * Genera el perfil de salida usando el modelo de Shinokura y Takai (Versión 3 - Sensible a la luz y R_tabla).
 */
export function generarPerfilsalidahinokura3(perfilCanal, perfilEntrada, valorLuz, R_tabla, alpha = 0.85, n_puntos = 10) {
    console.log("R de tabla:" , R_tabla);
    const H0 = Math.max(...perfilEntrada.Y);
    const W0 = Math.max(...perfilEntrada.X) * 2;
    const A0 = calcularAreaDesdePuntos(perfilEntrada.X, perfilEntrada.Y);

    const H_canal_max = Math.max(...perfilCanal.Y);
    const dH_eq = Math.max(0.1, H0 - H_canal_max - (valorLuz / 2)); 

    const factorAncho = Math.sqrt(R_tabla * dH_eq);
    const delta_W = alpha * factorAncho * (1.0 - (H0 / (H0 + dH_eq + valorLuz)));
    
    let half_W1 = (W0 / 2) + delta_W;
    const half_W_canal_max = Math.max(...perfilCanal.X);

    if (half_W1 > half_W_canal_max) {
        console.warn(`[Aviso de Sobrellenado] El semiancho predicho (${half_W1.toFixed(2)}) supera el canal (${half_W_canal_max.toFixed(2)}).`);
    }
    
    let half_W_final = Math.min(half_W1, half_W_canal_max);

    let X_out = linespace(0, half_W_final, Math.max(20, Math.floor(half_W_final * n_puntos)));
    let Y_out = X_out.map(x => {
        let y_canal = interpolarY(perfilCanal, x);
        return Math.max(0, y_canal + (valorLuz / 2));
    });

    return { X: X_out, Y: Y_out };
}

/**
 * Genera el perfil de salida usando el modelo de Shinokura y Takai (Versión 2).
 */
export function generarPerfilsalidahinokura2(perfilCilindro, P_in, g, R_tabla, alpha = 0.85, n_puntos_libre = 25) {
    console.log("R de tabla:" , R_tabla);
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    const obtenerAlturaEn = function(x) {
        let x_abs = Math.abs(x);
        if (x_abs > half_W0) return 0;
        
        for (let i = 0; i < X_in.length - 1; i++) {
            if (x_abs >= X_in[i] && x_abs <= X_in[i + 1]) {
                let t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i]);
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]));
            }
        }
        return 2 * Y_in[Y_in.length - 1];
    };

    let X_dh = [];
    let Y_dh = [];
    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;

        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        
        X_dh.push(x);
        Y_dh.push(dh);

        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_tabla - y_c_media; 

    const factorGeometria = Math.sqrt(R_eff * dH_eq) / (W0 + 0.5 * H0_eq);
    const W1 = W0 * (1 + alpha * (Ah / A0) * factorGeometria);
    const half_W1 = W1 / 2;
    
    const half_W_canal_max = Math.max(...X_c);
    const half_W_final = Math.min(half_W1, half_W_canal_max);

    let X_out = [];
    let Y_out = [];

    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    if (half_W_final > x_cont) {
        let dx_libre = (half_W_final - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W_final - x_cont);
            let y = y_cont - (y_cont - half_g) * Math.pow(t, 2);

            X_out.push(x);
            Y_out.push(y);
        }
    }

    X_out = X_out.map(x => trunc(x, 2));
    Y_out = Y_out.map(y => trunc(y, 2));        

    return { X: X_out, Y: Y_out };
}

/**
 * Genera el perfil de salida usando el modelo base de Shinokura y Takai.
 */
export function generarPerfilsalidahinokura(perfilCilindro, P_in, g, R_tabla, alpha = 0.85, n_puntos_libre = 25) {
    console.log("R de tabla:" , R_tabla);
    return generarPerfilsalidahinokura2(perfilCilindro, P_in, g, R_tabla, alpha, n_puntos_libre);
}

/**
 * Genera el perfil de salida usando el modelo iterativo de Zheng (2010) para aceros aleados.
 */
export function generarPerfilSalidaZheng(perfilCilindro, P_in, g, R_tabla, m_material = 1.25, gamma = 0.97, maxIter = 3) {
    console.log("R de tabla:" , R_tabla);
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);
    const H0 = Math.max(...Y_in) * 2;

    let Ah = 0;
    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;

    const obtenerAlturaEn = function(x) {
        let x_abs = Math.abs(x);
        if (x_abs > half_W0) return 0;
        for (let i = 0; i < X_in.length - 1; i++) {
            if (x_abs >= X_in[i] && x_abs <= X_in[i + 1]) {
                let t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i]);
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]));
            }
        }
        return 2 * Y_in[Y_in.length - 1];
    };

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;
        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        if (i > 0) {
            let dx = X_c[i] - X_c[i - 1];
            Ah += dh * dx;
        }
        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }
    Ah = Ah * 2;

    let delta_b = 0;
    let H_mi = A0 / W0;
    let R_eff = R_tabla - (n_contacto > 0 ? (y_c_suma / n_contacto) : 0);

    for (let iter = 0; iter < maxIter; iter++) {
        let factorGeometria = Math.sqrt(R_eff * Math.max(0.1, H0 - H_mi)) / (W0 + 0.5 * H0);
        delta_b = m_material * gamma * factorGeometria * (Ah / A0) * W0;
        
        let W_temp = W0 + delta_b;
        H_mi = A0 / W_temp;
    }

    const W1 = W0 + delta_b;
    const half_W1 = W1 / 2;
    const half_W_canal_max = Math.max(...X_c);
    let half_W_final = Math.min(half_W1, half_W_canal_max);

    let X_out = [];
    let Y_out = [];

    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    if (half_W_final > x_cont) {
        let dx_libre = (half_W_final - x_cont) / 25;

        for (let i = 1; i <= 25; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W_final - x_cont);
            let y = y_cont - (y_cont - half_g) * Math.pow(t, 2);

            X_out.push(x);
            Y_out.push(y);
        }
    }

    X_out = X_out.map(x => trunc(x, 2));
    Y_out = Y_out.map(y => trunc(y, 2));

    return { X: X_out, Y: Y_out };
}


/**
 * Rota el perfil de salida de una caja 90° para que sirva como entrada (P_in) de la siguiente caja.
 * @param {Object} salidaAnterior - Objeto { X, Y, W1 } devuelto por la función de salida de la caja previa.
 * @returns {Object} P_in - Objeto de entrada estandarizado para la siguiente caja.
 */
/**
 * Rota el perfil de salida de una caja 90° y asegura que los puntos de entrada 
 * estén ordenados de forma ascendente para la interpolación de Shinokura-Takai.
 */
/**
 * Rota el perfil de salida de una caja 90° para que sirva correctamente como entrada (P_in) de la siguiente caja.
 */
export function rotarSalidaAEntrada(perfilEntrada) {
    if (!perfilEntrada || !perfilEntrada.X || perfilEntrada.X.length === 0) {
        return { X: [], Y: [] };
    }

    // 1. Calcular área y dimensiones originales para asegurar conservación de masa/volumen
    let areaOriginal = calcularAreaDesdePuntos(perfilEntrada.X, perfilEntrada.Y);
    let max_X = Math.max(...perfilEntrada.X);
    let max_Y = Math.max(...perfilEntrada.Y);

    // 2. Intercambio de ejes (Rotación 90°): 
    let nuevo_half_W = max_Y; 
    let n_puntos = perfilEntrada.X.length;

    let X_rot = linespace(0, nuevo_half_W, n_puntos);
    
    // Mapeo inverso de coordenadas normalizado para conservar el área transversal exacta
    let factorEscalaArea = nuevo_half_W > 0 ? (max_X / nuevo_half_W) : 1.0;

    let Y_rot = X_rot.map(x => {
        let xCorrespondiente = Math.min(max_X, x * factorEscalaArea);
        let yInterp = interpolarY(perfilEntrada, max_X - xCorrespondiente);
        return Math.max(0, yInterp * (max_X / Math.max(1e-5, nuevo_half_W)));
    });

    // Ajuste fino para garantizar la coincidencia exacta del área original tras la rotación
    let areaRotadaActual = calcularAreaDesdePuntos(X_rot, Y_rot);
    if (areaRotadaActual > 0) {
        let factorCorreccionArea = Math.sqrt(areaOriginal / areaRotadaActual);
        Y_rot = Y_rot.map(y => y * factorCorreccionArea);
    }

    return {
        X: X_rot,
        Y: Y_rot
    };
}
    