/*calculo_laminación.js*/
import { cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM } from './cilindro.js';
import { aplicarLuz, simetria, truncarRelleno, calcular_X, interpolarY, calcularAreaDesdePuntos, crearFuncionAltura, trunc, linespace } from './calculos.js';



/** 
 * Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función cilindro_AH
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} mu - Coeficiente de fricción (ej. 0.35 para acero de alto carbono en caliente)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilSalidaEkelund(perfilCilindro, P_in, g, R_nom, mu = 0.35, n_puntos_libre = 25) {
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    ////_j_ 1. Cálculo automático de W0 y A0 reutilizando la función de área
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);


    ////_j_ Función interna para consultar la altura de entrada interpolando los puntos
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

    ////_j_ 2. Generación de puntos de la diferencia (dh) para calcular el Ah total con la función reutilizable
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
        Y_dh.push(dh); // Almacenamos la diferencia de altura temporalmente en Y

        //_j_ Detección de contacto físico con el calibre
        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    //_J_ Obtenemos el Ah total mediante la integración trapezoidal reutilizada
    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);


 /*==================Asta aquí comun ambos modelos ======== */


    //_j_ 3. Aplicación del Modelo de Ekelund Modificado para el ensanchamiento (delta_b)
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const h1_eq = H0_eq - dH_eq;
    //_j_ Obtener el ancho máximo físico que permite el canal en el primer cuadrante
    const half_W_canal_max = Math.max(...X_c);
    
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_nom - y_c_media; // Radio efectivo ponderado localmente

    let divisor_h = H0_eq + h1_eq;
    let m_eq = divisor_h > 0 ? (1.6 * mu * Math.sqrt(R_eff * dH_eq)) / divisor_h : 0;

    let numerador = m_eq * dH_eq * Math.sqrt(R_eff * dH_eq);
    let denominador = H0_eq + m_eq * h1_eq;
    let delta_b = denominador > 0 ? (numerador / denominador) : 0;

    const W1 = W0 + delta_b/2;
    const half_W1_calculado = W1 / 2;
    //_j_ RESTRICCIÓN FÍSICA: El material no puede rebasar la caja (tope contra el canal)
    const half_W1 = Math.min(half_W1_calculado, half_W_canal_max);
    //_m_ ================== Hasta aquí común ambos modelos ================== */

    // 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    let X_out = [];
    let Y_out = [];

    //_j_ --- Zona de Contacto con el Calibre ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    //_j_ --- Zona Libre / Abombamiento Lateral (Curva Parabólica de Transición) ---
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

        X_out=X_out.map(x=> trunc(x,2));
        Y_out=Y_out.map(y=> trunc(y,2));
    //_j_ Devuelve estrictamente el objeto {X, Y} del primer cuadrante listo para la rotación de 90°
    return {
        X: X_out,
        Y: Y_out
    };
}

/**
 * Calcula el ensanchamiento lateral (Δb) utilizando el modelo iterativo de Zheng et al. (2010)
 * Ideal para aceros aleados (ej. GCr15 con m entre 1.24 y 1.308).
 * 
 * @param {number} W0 - Ancho inicial de la barra (mm)
 * @param {number} H0 - Altura máxima inicial de la barra (mm)
 * @param {number} A0 - Área de entrada (mm²)
 * @param {number} Ah - Área de reducción o deformación (mm²)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} m_material - Coeficiente del material (ej. 1.28 para GCr15, 1.0 para acero al carbono)[cite: 1]
 * @param {number} maxIter - Número máximo de iteraciones (suele converger entre 3 y 5)
 * @returns {number} delta_b - Ensanchamiento absoluto final (mm)
 */
export function calcularSpreadZhengIterativo(W0, H0, A0, Ah, R_nom, m_material = 1.28, maxIter = 5) {
    let delta_b = 0;
    let Hm_eq = H0 * 0.75; // Estimación inicial de la altura equivalente media
    let R_eff = R_nom;     // Radio efectivo inicial del rodillo

    for (let i = 0; i < maxIter; i++) {
        let gamma = 1.0; // Factor de corrección de reducción

        // Término de la raíz cuadrada con la altura equivalente actual de la iteración
        let term_raiz = Math.sqrt(R_eff * Math.max(0, H0 - Hm_eq));
        let denominador = W0 + 0.5 * H0;
        
        if (denominador <= 0) break;

        // Fórmula base modificada de Zheng et al. (2010)
        let delta_b_nuevo = m_material * gamma * (term_raiz / denominador) * (Ah / A0) * W0;

        // Criterio de convergencia (si la variación es menor a 0.01 mm, detenemos el bucle)
        if (Math.abs(delta_b_nuevo - delta_b) < 0.01 && i > 0) {
            delta_b = delta_b_nuevo;
            break;
        }

        delta_b = delta_b_nuevo;

        // Actualización iterativa de la geometría y la altura equivalente media (Hm_eq)
        let W_actual = W0 + delta_b;
        Hm_eq = Ah / W_actual; 
        
        // Ajuste dinámico del radio efectivo ponderado en función de la deformación
        R_eff = R_nom - (H0 - Hm_eq) * 0.1; 
    }

    return delta_b;
}

/** 
 * Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función cilindro_AH
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} mu - Coeficiente de fricción (ej. 0.35 para acero de alto carbono en caliente)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilSalidaEkelundZheng(perfilCilindro, P_in, g, R_nom, mu = 0.35, n_puntos_libre = 25) {
   const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    // 1. Cálculo automático de W0 y A0 reutilizando la función de área
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);


    // Función interna para consultar la altura de entrada interpolando los puntos
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

    // 2. Generación de puntos de la diferencia (dh) para calcular el Ah total con la función reutilizable
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
        Y_dh.push(dh); // Almacenamos la diferencia de altura temporalmente en Y

        // Detección de contacto físico con el calibre
        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    // Obtenemos el Ah total mediante la integración trapezoidal reutilizada
    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);


 /*==================Asta aquí comun ambos modelos ======== */


    // 3. Aplicación del Modelo de Ekelund Modificado para el ensanchamiento (delta_b)
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const h1_eq = H0_eq - dH_eq;

    
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_nom - y_c_media; // Radio efectivo ponderado localmente

    const m_acero_aleado = 1.28; // Coeficiente para aceros especiales como GCr15[cite: 1]

    let delta_b = function (W0, H0, A0, Ah, R_nom, m_material = 1.28, maxIter = 5) {
        let delta_b = 0;
        let Hm_eq = H0 * 0.75; // Estimación inicial de la altura equivalente media
        let R_eff = R_nom;     // Radio efectivo inicial del rodillo

        for (let i = 0; i < maxIter; i++) {
            let gamma = 1.0; // Factor de corrección de reducción

            // Término de la raíz cuadrada con la altura equivalente actual de la iteración
            let term_raiz = Math.sqrt(R_eff * Math.max(0, H0 - Hm_eq));
            let denominador = W0 + 0.5 * H0;
            
            if (denominador <= 0) break;

            // Fórmula base modificada de Zheng et al. (2010)
            let delta_b_nuevo = m_material * gamma * (term_raiz / denominador) * (Ah / A0) * W0;

            // Criterio de convergencia (si la variación es menor a 0.01 mm, detenemos el bucle)
            if (Math.abs(delta_b_nuevo - delta_b) < 0.01 && i > 0) {
                delta_b = delta_b_nuevo;
                break;
            }

            delta_b = delta_b_nuevo;

            // Actualización iterativa de la geometría y la altura equivalente media (Hm_eq)
            let W_actual = W0 + delta_b;
            Hm_eq = Ah / W_actual; 
            
            // Ajuste dinámico del radio efectivo ponderado en función de la deformación
            R_eff = R_nom - (H0 - Hm_eq) * 0.1; 
        }

        return delta_b;
    }
    
    


    // 4. Definir el ancho total y aplicar la restricción física de la caja
    const half_W_canal_max = Math.max(...X_c);
    const half_W1_calculado = (W0 + delta_b) / 2;
   


    // RESTRICCIÓN FÍSICA: El material no puede rebasar la caja (tope contra el canal)
    const half_W1 = Math.min(half_W1_calculado, half_W_canal_max);
    /* ================== Hasta aquí común ambos modelos ================== */

    // 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    let X_out = [];
    let Y_out = [];

    // --- Zona de Contacto con el Calibre ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    // --- Zona Libre / Abombamiento Lateral (Curva Parabólica de Transición) ---
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

        X_out=X_out.map(x=> trunc(x,2));
        Y_out=Y_out.map(y=> trunc(y,2));
    // Devuelve estrictamente el objeto {X, Y} del primer cuadrante listo para la rotación de 90°
    return {
        X: X_out,
        Y: Y_out
    };
}
/** 
 * Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función cilindro_AH
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} mu - Coeficiente de fricción (ej. 0.35 para acero de alto carbono en caliente)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilSalidaEkelundZheng2(perfilCilindro, P_in, g, R_nom, mu = 0.35, n_puntos_libre = 25) {
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    // 1. Cálculo automático de W0 y A0
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    // Función interna para consultar la altura de entrada
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

    // 2. Cálculo de la reducción de área (Ah)
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
    
    // Ah es la integral de la diferencia de altura. 
    // Al estar dh en "altura total", multiplicar por 2 da el área de los 4 cuadrantes.
    Ah = Ah * 2; 

    // 3. Aplicación del Modelo de Ekelund Clásico (Mucho más estable para grandes reducciones)
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const h1_eq = Math.max(0.1, H0_eq - dH_eq); // Evitar división por cero
    
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_nom - y_c_media; 
    
        // --- NUEVO: CÁLCULO DEL ÁNGULO DE MORDEDURA ---
    // Fórmula: cos(ángulo) = 1 - (reducción de altura / (2 * radio))
    let cos_angulo = 1 - (dH_eq / (2 * R_eff));
    // Nos aseguramos de que el valor esté entre -1 y 1 para evitar errores de Math.acos
    cos_angulo = Math.max(-1, Math.min(1, cos_angulo)); 
    let angulo_mordedura_rad = Math.acos(cos_angulo);
    let angulo_mordedura_deg = angulo_mordedura_rad * (180 / Math.PI); // Convertir a grados
    //_Ja_console.log("Ángulo de mordedura (Ekelund):", angulo_mordedura_deg.toFixed(2), "°");
    // ----------------------------------------------

    
    const m_eq = (1.6 * mu * Math.sqrt(R_eff * dH_eq)) / (H0_eq + h1_eq);
    
    let numerador = m_eq * dH_eq * Math.sqrt(R_eff * dH_eq);
    let denominador = H0_eq + m_eq * h1_eq;
    let delta_b = denominador > 0 ? (numerador / denominador) : 0;

    // 4. Restricción física del canal
    const half_W_canal_max = Math.max(...X_c);
    const half_W1_calculado = (W0 + delta_b) / 2;
    
    // El material no puede rebasar el ancho máximo del canal
    const half_W1 = Math.min(half_W1_calculado, half_W_canal_max);

    // 5. Construcción de la matriz de puntos de salida
    let X_out = [];
    let Y_out = [];

    // --- Zona de Contacto con el Calibre ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    // --- Zona Libre / Abombamiento Lateral ---
    if (half_W1 > x_cont) {
        let dx_libre = (half_W1 - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W1 - x_cont);
            
            // Curva parabólica de abombamiento
            let y_parabola = y_cont - (y_cont - half_g) * Math.pow(t, 2);
            
            // Recorte contra el perfil del rodillo (usando interpolación segura)
            let y_canal_max = interpolarY({ X: X_c, Y: Y_luz }, x);
            let y_final = Math.min(y_parabola, y_canal_max);
            y_final = Math.max(half_g, y_final); // Evitar bajar de la luz

            X_out.push(x);
            Y_out.push(y_final);
        }
    }

    X_out = X_out.map(x => trunc(x, 2));
    Y_out = Y_out.map(y => trunc(y, 2));

    return {
        X: X_out,
        Y: Y_out
    };
}

/**
 * Genera el perfil de salida usando el modelo de Shinokura y Takai.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función de cilindro (ej. óvalo/redondo)
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} alpha - Coeficiente de Shinokura (por defecto 0.85)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilsalidahinokura3(perfilCanal, perfilEntrada, valorLuz, R_tabla, alpha = 0.85, n_puntos = 10) {
    // 1. Obtener altura máxima y anchura del perfil de entrada
    const H0 = Math.max(...perfilEntrada.Y);
    const W0 = Math.max(...perfilEntrada.X) * 2;
    const A0 = calcularAreaDesdePuntos(perfilEntrada.X, perfilEntrada.Y);

    // 2. Incorporar la luz (valorLuz) de manera efectiva en la altura de referencia inicial (delta H eq)
    // El canal se evalúa considerando el efecto del gap en las condiciones de entrada
    const H_canal_max = Math.max(...perfilCanal.Y);
    const dH_eq = Math.max(0.1, H0 - H_canal_max - (valorLuz / 2)); 

    // 3. Cálculo del ensanchamiento sensible a la luz y al radio de tabla (R_tabla)
    const factorAncho = Math.sqrt(R_tabla * dH_eq);
    const delta_W = alpha * factorAncho * (1.0 - (H0 / (H0 + dH_eq + valorLuz)));
    
    let half_W1 = (W0 / 2) + delta_W;
    const half_W_canal_max = Math.max(...perfilCanal.X);

    // Control de llenado (evita recortes silenciosos extremos, emitiendo aviso o ajustando)
    if (half_W1 > half_W_canal_max) {
        console.warn(`[Aviso de Sobrellenado] El semiancho predicho (${half_W1.toFixed(2)}) supera el canal (${half_W_canal_max.toFixed(2)}).`);
    }
    
    let half_W_final = Math.min(half_W1, half_W_canal_max);

    // Generar la nueva sección de salida integrada con la luz real
    let X_out = linespace(0, half_W_final, Math.max(20, Math.floor(half_W_final * n_puntos)));
    let Y_out = X_out.map(x => {
        // Interpolar contra el contorno del canal con el desplazamiento de la luz aplicado
        let y_canal = interpolarY(perfilCanal, x);
        return Math.max(0, y_canal + (valorLuz / 2));
    });

    return {
        X: X_out,
        Y: Y_out
    };
}
/**
 * Genera el perfil de salida usando el modelo de Shinokura y Takai.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función de cilindro (ej. óvalo/redondo)
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} alpha - Coeficiente de Shinokura (por defecto 0.85)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilsalidahinokura2(perfilCilindro, P_in, g, R_nom, alpha = 0.85, n_puntos_libre = 25) {
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    // 1. Cálculo automático de W0 y A0 desde el primer cuadrante
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    // Función interna para consultar la altura de entrada interpolando los puntos
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

    // 2. Generación de puntos de la diferencia (dh) para calcular el Ah total de forma modular
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
        Y_dh.push(dh); // Almacenamos la diferencia de altura temporalmente en Y

        
        // Detección de contacto físico con el calibre cerrado
        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    // Obtenemos el Ah total mediante la integración trapezoidal reutilizada
    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);

    /* ================== Hasta aquí común ambos modelos ================== */

    // 3. Aplicación del Modelo de Shinokura y Takai para el ensanchamiento
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_nom - y_c_media; // Radio efectivo ponderado localmente

    const factorGeometria = Math.sqrt(R_eff * dH_eq) / (W0 + 0.5 * H0_eq);
    const W1 = W0 * (1 + alpha * (Ah / A0) * factorGeometria);
    const half_W1 = W1 / 2;

/* ================== Hasta aquí común ambos modelos ================== */
    
// 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    let X_out = [];
    let Y_out = [];

    // --- Zona de Contacto con el Calibre ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    // --- Zona Libre / Abombamiento Lateral (*Free Surface Bulging*) ---
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

    X_out=X_out.map(x=> trunc(x,2));
    Y_out=Y_out.map(y=> trunc(y,2));        

    // Devuelve estrictamente y únicamente el perfil laminado { X, Y } del primer cuadrante
    return {
        X: X_out,
        Y: Y_out
    };
}
/**
 * Genera el perfil de salida usando el modelo de Shinokura y Takai.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función de cilindro (ej. óvalo/redondo)
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} alpha - Coeficiente de Shinokura (por defecto 0.85)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilsalidahinokura(perfilCilindro, P_in, g, R_nom, alpha = 0.85, n_puntos_libre = 25) {

    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    // 1. Cálculo automático de W0 y A0 desde el primer cuadrante
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    const A0 = calcularAreaDesdePuntos(X_in, Y_in);

    // Función interna para consultar la altura de entrada usando interpolarY con objeto
    const obtenerAlturaEn = function(x) {
        let x_abs = Math.abs(x);
        if (x_abs > half_W0) return 0;
        return 2 * interpolarY({ X: X_in, Y: Y_in }, x_abs);
    };

    // 2. Generación de puntos de la diferencia (dh) para calcular el Ah total
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

        // Detección de contacto físico con el calibre cerrado
        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    // Obtenemos el Ah total mediante la integración trapezoidal
    const Ah = calcularAreaDesdePuntos(X_dh, Y_dh);

    // 3. Aplicación del Modelo de Shinokura y Takai para el ensanchamiento
    const H0_eq = A0 / W0;
    const dH_eq = Ah / W0;
    const y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
    const R_eff = R_nom - y_c_media; // Radio efectivo ponderado localmente

    const factorGeometria = Math.sqrt(R_eff * dH_eq) / (W0 + 0.5 * H0_eq);
    const W1 = W0 * (1 + alpha * (Ah / A0) * factorGeometria);
    const half_W1 = W1 / 2;

    // Límite físico máximo del ancho del canal
    const half_W_canal_max = Math.max(...X_c);
    const half_W1_efectivo = Math.min(half_W1, half_W_canal_max);

    // 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    let X_out = [];
    let Y_out = [];

    // --- Zona de Contacto con el Calibre ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    // --- Zona Libre / Abombamiento Lateral con Restricción de Canal ---
    if (half_W1_efectivo > x_cont) {
        let dx_libre = (half_W1_efectivo - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W1_efectivo - x_cont);
            
            // Altura calculada por la parábola de abombamiento libre
            let y_parabola = y_cont - (y_cont - half_g) * Math.pow(t, 2);

            // Interpolación de la altura máxima permitida por la canal en este punto x
            let y_canal_max = interpolarY({ X: X_c, Y: Y_luz }, x);

            // RESTRICCIÓN FÍSICA: La altura nunca puede rebasar el perfil del rodillo
            let y_final = Math.min(y_parabola, y_canal_max);
            y_final = Math.max(half_g, y_final); // Evitar bajar de la luz mínima

            X_out.push(x);
            Y_out.push(y_final);
        }
    }

    // Devuelve estrictamente y únicamente el perfil laminado { X, Y } del primer cuadrante
    return {
        X: X_out,
        Y: Y_out
    };
}


/**
 * Genera el perfil de salida usando el modelo iterativo de Zheng (2010) para aceros aleados.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función de cilindro (ej. óvalo/redondo)
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} m_material - Coeficiente de influencia del material (por defecto 1.25 para aceros aleados como GCr15)[cite: 15]
 * @param {number} gamma - Factor de corrección del tipo de pase (por defecto 0.97 para óvalo)[cite: 15]
 * @param {number} maxIter - Número máximo de iteraciones para la convergencia (por defecto 3)[cite: 18]
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilSalidaZheng(perfilCilindro, P_in, g, R_nom, m_material = 1.25, gamma = 0.97, maxIter = 3) {
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

    // 1. Integración numérica inicial para hallar Ah
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

    // 2. Modelo Iterativo de Zheng (2010) para el ensanchamiento
    let delta_b = 0;
    let H_mi = A0 / W0;
    let R_eff = R_nom - (n_contacto > 0 ? (y_c_suma / n_contacto) : 0);

    for (let iter = 0; iter < maxIter; iter++) {
        let factorGeometria = Math.sqrt(R_eff * Math.max(0.1, H0 - H_mi)) / (W0 + 0.5 * H0);
        delta_b = m_material * gamma * factorGeometria * (Ah / A0) * W0;
        
        // Actualización iterativa equivalente según Zheng
        let W_temp = W0 + delta_b;
        H_mi = A0 / W_temp;
    }

    const W1 = W0 + delta_b;
    const half_W1 = W1 / 2;
    const half_W_canal_max = Math.max(...X_c);
    const half_W1_efectivo = Math.min(half_W1, half_W_canal_max);

    // 3. Reconstrucción geométrica del perfil de salida
    let X_out = [];
    let Y_out = [];

    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    if (half_W1_efectivo > x_cont) {
        let n_puntos_libre = 25;
        let dx_libre = (half_W1_efectivo - x_cont) / n_puntos_libre;

        for (let i = 1; i <= n_puntos_libre; i++) {
            let x = x_cont + i * dx_libre;
            let t = (x - x_cont) / (half_W1_efectivo - x_cont);
            let y_parabola = y_cont - (y_cont - half_g) * Math.pow(t, 2);
            let y_canal_max = interpolarY({ X: X_c, Y: Y_luz }, x);

            let y_final = Math.min(y_parabola, y_canal_max);
            y_final = Math.max(half_g, y_final);

            X_out.push(x);
            Y_out.push(y_final);
        }
    }

    return {
        X: X_out.map(v => trunc(v, 2)),
        Y: Y_out.map(v => trunc(v, 2))
    };
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
    // La antigua altura máxima pasa a ser la semianchura base, y el ancho pasa a ser la altura.
    let nuevo_half_W = max_Y; 
    let n_puntos = perfilEntrada.X.length;

    let X_rot = linespace(0, nuevo_half_W, n_puntos);
    
    // Mapeo inverso de coordenadas normalizado para conservar el área transversal exacta
    let factorEscalaArea = nuevo_half_W > 0 ? (max_X / nuevo_half_W) : 1.0;

    let Y_rot = X_rot.map(x => {
        let xCorrespondiente = Math.min(max_X, x * factorEscalaArea);
        // Buscar la altura equivalente interpolando el perfil original invertido
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
    


/**
 * Genera el perfil de salida usando el modelo de Tafel y Sedlaczek.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función de cilindro
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilSalidaTafelSedlaczek(perfilCilindro, P_in, g, R_nom, n_puntos_libre = 25) {
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    // 1. Cálculo automático de propiedades desde el primer cuadrante
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    
    // Altura/espesor inicial de entrada máximo (2 veces la máxima altura del 1er cuadrante)
    const H0 = 2 * Math.max(...Y_in); 
    const Hout = g; // Espesor de salida de referencia en la luz

    // Función interna para consultar la altura de entrada interpolando los puntos
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

    // 2. Integración numérica para hallar el área reducida (Ah) y detectar contacto
    let Ah_cuadrante = 0;
    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;

        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        
        if (i > 0) {
            let dx = X_c[i] - X_c[i - 1];
            Ah_cuadrante += dh * dx;
        }

        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    // 3. Aplicación de la fórmula de Tafel y Sedlaczek para el ensanchamiento
    const dh_global = H0 - Hout;
    let delta_b = 0;

    if (dh_global > 0) {
        let y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
        let R_eff = R_nom - y_c_media; // Radio efectivo ponderado localmente

        let numerador = dh_global * W0 * Math.sqrt(W0 * R_eff);
        let denominador = 3 * (Math.pow(W0, 2) + (H0 * Hout));
        
        delta_b = denominador !== 0 ? numerador / denominador : 0;
    }

    const W1 = W0 + delta_b;
    const half_W1 = W1 / 2;

    // 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el primer cuadrante
    let X_out = [];
    let Y_out = [];

    // --- TRAMO A: Zona de Contacto ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    // --- TRAMO B: Zona Libre / Abombamiento Lateral (Curva parabólica) ---
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
    
    X_out=X_out.map(x=> trunc(x,2));
    Y_out=Y_out.map(y=> trunc(y,2));
    // Devuelve estrictamente el objeto { X, Y } del primer cuadrante para la siguiente etapa
    return {
        X: X_out,
        Y: Y_out
    };
}


/**
 * Genera el perfil de salida usando el modelo de Koncevicz.
 * Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
 * 
 * @param {Object} perfilCilindro - { X, Y } devuelto por tu función de cilindro
 * @param {Object} P_in - { X, Y } de la barra de entrada en el primer cuadrante
 * @param {number} g - Luz total entre cilindros (mm)
 * @param {number} R_nom - Radio nominal del cilindro (mm)
 * @param {number} n_puntos_libre - Puntos para discretizar la zona libre de abombamiento
 */
export function generarPerfilSalidaKoncevicz(perfilCilindro, P_in, g, R_nom, n_puntos_libre = 25) {
    const half_g = g / 2;
    const X_c = perfilCilindro.X;
    const Y_c = perfilCilindro.Y;
    const Y_luz = Y_c.map(y => y + half_g);

    const X_in = P_in.X;
    const Y_in = P_in.Y;

    // 1. Cálculo automático de propiedades desde el primer cuadrante
    const half_W0 = Math.max(...X_in);
    const W0 = 2 * half_W0;
    
    // Espesor/altura inicial de entrada (2 veces la altura máxima del 1er cuadrante)
    const H0 = 2 * Math.max(...Y_in); 
    const Hout = g; // Espesor de salida de referencia en la luz

    // Función interna para consultar la altura de entrada interpolando los puntos
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

    // 2. Integración numérica para hallar el área reducida (Ah) y detectar contacto
    let Ah_cuadrante = 0;
    let y_c_suma = 0;
    let n_contacto = 0;
    let idx_contacto = 0;

    for (let i = 0; i < X_c.length; i++) {
        let x = X_c[i];
        if (x > half_W0) break;

        let H0_x = obtenerAlturaEn(x); 
        let Y_canal_total = 2 * Y_luz[i];  
        let dh = Math.max(0, H0_x - Y_canal_total);
        
        if (i > 0) {
            let dx = X_c[i] - X_c[i - 1];
            Ah_cuadrante += dh * dx;
        }

        if (dh > 0) {
            y_c_suma += Y_c[i];
            n_contacto++;
            idx_contacto = i;
        }
    }

    // 3. Aplicación de la fórmula de Koncevicz para el ensanchamiento
    const dh_global = H0 - Hout;
    let delta_b = 0;

    if (dh_global > 0) {
        let y_c_media = n_contacto > 0 ? (y_c_suma / n_contacto) : 0;
        let R_eff = R_nom - y_c_media; // Radio efectivo ponderado localmente

        // Δb = 0.66 * (Δh / (hin + hout)) * sqrt(Δh * R_eff)
        delta_b = 0.66 * (dh_global / (H0 + Hout)) * Math.sqrt(dh_global * R_eff);
    }

    const W1 = W0 + delta_b;
    const half_W1 = W1 / 2;

    // 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el primer cuadrante
    let X_out = [];
    let Y_out = [];

    // --- TRAMO A: Zona de Contacto ---
    for (let i = 0; i <= idx_contacto; i++) {
        X_out.push(X_c[i]);
        Y_out.push(Y_luz[i]);
    }

    const x_cont = X_out[X_out.length - 1];
    const y_cont = Y_out[Y_out.length - 1];

    // --- TRAMO B: Zona Libre / Abombamiento Lateral (Curva parabólica) ---
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

    X_out=X_out.map(x=> trunc(x,2));
    Y_out=Y_out.map(y=> trunc(y,2));
    // Devuelve estrictamente el objeto { X, Y } del primer cuadrante listo para la rotación de 90°
    return {
        X: X_out,
        Y: Y_out
    };
}
