import numpy as np
import math
import calculos as calc
import sys
import os

#_P_ Agrega la carpeta 'py' al path de búsqueda de Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py')))

#_P_ Ahora puedes importarlos directamente:
from calculos import calcularAreaDesdePuntos, simetria, aplicarLuz
from cilindros import cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM, relleno_palanquilla





def generar_perfil_salida_ekelund(perfil_cilindro, P_in, g, R_nom, mu=0.35, n_puntos_libre=25, calcular_area_desde_puntos=None):
    """
    Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de W0 y A0 reutilizando la función de área
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        #_P_ Integración trapezoidal segura compatible con distintas versiones de NumPy
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)

    #_P_ Función interna para consultar la altura de entrada interpolando los puntos
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1]

    #_P_ 2. Generación de puntos de la diferencia (dh) para calcular el Ah total
    X_dh = []
    Y_dh = []
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break

        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        X_dh.append(x)
        Y_dh.append(dh)  #_P_ Almacenamos la diferencia de altura temporalmente en Y

        #_P_ Detección de contacto físico con el calibre
        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i

    X_dh = np.array(X_dh)
    Y_dh = np.array(Y_dh)

    #_P_ Obtenemos el Ah total mediante integración trapezoidal
    if calcular_area_desde_puntos is not None:
        Ah = calcular_area_desde_puntos(X_dh, Y_dh)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        Ah = trapz_func(Y_dh, X_dh) if trapz_func else np.sum((Y_dh[:-1] + Y_dh[1:]) * np.diff(X_dh) / 2)

    #_P_ 3. Aplicación del Modelo de Ekelund Modificado para el ensanchamiento (delta_b)
    H0_eq = A0 / W0 if W0 > 0 else 0
    dH_eq = Ah / W0 if W0 > 0 else 0
    h1_eq = H0_eq - dH_eq
    
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0
    
    y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
    R_eff = R_nom - y_c_media  #_P_ Radio efectivo ponderado localmente

    divisor_h = H0_eq + h1_eq
    m_eq = (1.6 * mu * math.sqrt(max(0.0, R_eff * dH_eq))) / divisor_h if divisor_h > 0 else 0.0

    numerador = m_eq * dH_eq * math.sqrt(max(0.0, R_eff * dH_eq))
    denominador = H0_eq + m_eq * h1_eq
    delta_b = (numerador / denominador) if denominador > 0 else 0.0

    W1 = W0 + delta_b / 2
    half_W1_calculado = W1 / 2
    
    #_P_ RESTRICCIÓN FÍSICA: El material no puede rebasar la caja (tope contra el canal)
    half_W1 = min(half_W1_calculado, half_W_canal_max)

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    X_out = []
    Y_out = []

    #_P_ --- Zona de Contacto con el Calibre ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ --- Zona Libre / Abombamiento Lateral (Curva Parabólica de Transición) ---
    if half_W1 > x_cont:
        dx_libre = (half_W1 - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1 - x_cont)
            y = y_cont - (y_cont - half_g) * (t ** 2)

            X_out.append(x)
            Y_out.append(y)

    #_P_ Función equivalente al trunc(x, 2) de JavaScript
    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]

    #_P_ Devuelve estrictamente el diccionario {X, Y} del primer cuadrante
    return {
        "X": X_out,
        "Y": Y_out
    }


def calcular_spread_zheng_iterativo(W0, H0, A0, Ah, R_nom, m_material=1.28, maxIter=5):
    """
    Calcula el ensanchamiento lateral (Δb) utilizando el modelo iterativo de Zheng et al. (2010).
    Ideal para aceros aleados (ej. GCr15 con m entre 1.24 y 1.308).
    
    Parámetros:
    - W0: Ancho inicial de la barra (mm)
    - H0: Altura máxima inicial de la barra (mm)
    - A0: Área de entrada (mm²)
    - Ah: Área de reducción o deformación (mm²)
    - R_nom: Radio nominal del cilindro (mm)
    - m_material: Coeficiente del material (ej. 1.28 para GCr15, 1.0 para acero al carbono)
    - maxIter: Número máximo de iteraciones (suele converger entre 3 y 5)
    
    Retorna:
    - delta_b: Ensanchamiento absoluto final (mm)
    """
    delta_b = 0.0
    Hm_eq = H0 * 0.75  #_P_ Estimación inicial de la altura equivalente media
    R_eff = R_nom      #_P_ Radio efectivo inicial del rodillo

    for i in range(maxIter):
        gamma = 1.0  #_P_ Factor de corrección de reducción

        #_P_ Término de la raíz cuadrada con la altura equivalente actual de la iteración
        term_raiz = np.sqrt(R_eff * max(0.0, H0 - Hm_eq))
        denominador = W0 + 0.5 * H0
        
        if denominador <= 0:
            break

        #_P_ Fórmula base modificada de Zheng et al. (2010)
        delta_b_nuevo = m_material * gamma * (term_raiz / denominador) * (Ah / A0) * W0

        #_P_ Criterio de convergencia (si la variación es menor a 0.01 mm, detenemos el bucle)
        if abs(delta_b_nuevo - delta_b) < 0.01 and i > 0:
            delta_b = delta_b_nuevo
            break

        delta_b = delta_b_nuevo

        #_P_ Actualización iterativa de la geometría y la altura equivalente media (Hm_eq)
        W_actual = W0 + delta_b
        Hm_eq = Ah / W_actual if W_actual > 0 else 0.0
        
        #_P_ Ajuste dinámico del radio efectivo ponderado en función de la deformación
        R_eff = R_nom - (H0 - Hm_eq) * 0.1

    return float(delta_b)


def generar_perfil_salida_ekelund(perfil_cilindro, P_in, g, R_nom, mu=0.35, n_puntos_libre=25, calcular_area_desde_puntos=None):
    """
    Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de W0 y A0 reutilizando la función de área
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        #_P_ Integración trapezoidal segura compatible con distintas versiones de NumPy
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)

    #_P_ Función interna para consultar la altura de entrada interpolando los puntos
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1]

    #_P_ 2. Generación de puntos de la diferencia (dh) para calcular el Ah total
    X_dh = []
    Y_dh = []
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break

        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        X_dh.append(x)
        Y_dh.append(dh)  #_P_ Almacenamos la diferencia de altura temporalmente en Y

        #_P_ Detección de contacto físico con el calibre
        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i

    X_dh = np.array(X_dh)
    Y_dh = np.array(Y_dh)

    #_P_ Obtenemos el Ah total mediante integración trapezoidal
    if calcular_area_desde_puntos is not None:
        Ah = calcular_area_desde_puntos(X_dh, Y_dh)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        Ah = trapz_func(Y_dh, X_dh) if trapz_func else np.sum((Y_dh[:-1] + Y_dh[1:]) * np.diff(X_dh) / 2)

    #_P_ 3. Aplicación del Modelo de Ekelund Modificado para el ensanchamiento (delta_b)
    H0_eq = A0 / W0 if W0 > 0 else 0
    dH_eq = Ah / W0 if W0 > 0 else 0
    h1_eq = H0_eq - dH_eq
    
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0
    
    y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
    R_eff = R_nom - y_c_media  #_P_ Radio efectivo ponderado localmente

    divisor_h = H0_eq + h1_eq
    m_eq = (1.6 * mu * math.sqrt(max(0.0, R_eff * dH_eq))) / divisor_h if divisor_h > 0 else 0.0

    numerador = m_eq * dH_eq * math.sqrt(max(0.0, R_eff * dH_eq))
    denominador = H0_eq + m_eq * h1_eq
    delta_b = (numerador / denominador) if denominador > 0 else 0.0

    W1 = W0 + delta_b / 2
    half_W1_calculado = W1 / 2
    
    #_P_ RESTRICCIÓN FÍSICA: El material no puede rebasar la caja (tope contra el canal)
    half_W1 = min(half_W1_calculado, half_W_canal_max)

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    X_out = []
    Y_out = []

    #_P_ --- Zona de Contacto con el Calibre ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ --- Zona Libre / Abombamiento Lateral (Curva Parabólica de Transición) ---
    if half_W1 > x_cont:
        dx_libre = (half_W1 - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1 - x_cont)
            y = y_cont - (y_cont - half_g) * (t ** 2)

            X_out.append(x)
            Y_out.append(y)

    #_P_ Función equivalente al trunc(x, 2) de JavaScript
    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]

    #_P_ Devuelve estrictamente el diccionario {X, Y} del primer cuadrante
    return {
        "X": X_out,
        "Y": Y_out
    }


def calcular_spread_zheng_iterativo(W0, H0, A0, Ah, R_nom, m_material=1.28, maxIter=5):
    """
    Calcula el ensanchamiento lateral (Δb) utilizando el modelo iterativo de Zheng et al. (2010).
    Ideal para aceros aleados (ej. GCr15 con m entre 1.24 y 1.308).
    
    Parámetros:
    - W0: Ancho inicial de la barra (mm)
    - H0: Altura máxima inicial de la barra (mm)
    - A0: Área de entrada (mm²)
    - Ah: Área de reducción o deformación (mm²)
    - R_nom: Radio nominal del cilindro (mm)
    - m_material: Coeficiente del material (ej. 1.28 para GCr15, 1.0 para acero al carbono)
    - maxIter: Número máximo de iteraciones (suele converger entre 3 y 5)
    
    Retorna:
    - delta_b: Ensanchamiento absoluto final (mm)
    """
    delta_b = 0.0
    Hm_eq = H0 * 0.75  #_P_ Estimación inicial de la altura equivalente media
    R_eff = R_nom      #_P_ Radio efectivo inicial del rodillo

    for i in range(maxIter):
        gamma = 1.0  #_P_ Factor de corrección de reducción

        #_P_ Término de la raíz cuadrada con la altura equivalente actual de la iteración
        term_raiz = np.sqrt(R_eff * max(0.0, H0 - Hm_eq))
        denominador = W0 + 0.5 * H0
        
        if denominador <= 0:
            break

        #_P_ Fórmula base modificada de Zheng et al. (2010)
        delta_b_nuevo = m_material * gamma * (term_raiz / denominador) * (Ah / A0) * W0

        #_P_ Criterio de convergencia (si la variación es menor a 0.01 mm, detenemos el bucle)
        if abs(delta_b_nuevo - delta_b) < 0.01 and i > 0:
            delta_b = delta_b_nuevo
            break

        delta_b = delta_b_nuevo

        #_P_ Actualización iterativa de la geometría y la altura equivalente media (Hm_eq)
        W_actual = W0 + delta_b
        Hm_eq = Ah / W_actual if W_actual > 0 else 0.0
        
        #_P_ Ajuste dinámico del radio efectivo ponderado en función de la deformación
        R_eff = R_nom - (H0 - Hm_eq) * 0.1

    return float(delta_b)


def generar_perfil_salida_ekelund_zheng_2(perfil_cilindro, P_in, g, R_nom, mu=0.35, n_puntos_libre=25, calcular_area_desde_puntos=None, interpolar_y_func=None):
    """
    Genera el perfil de salida para la Caja AH usando el Modelo de Ekelund Modificado (Versión 2).
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de W0 y A0
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)

    #_P_ Función interna para consultar la altura de entrada
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1]

    #_P_ 2. Cálculo de la reducción de área (Ah)
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0
    Ah = 0.0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break
        
        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        if i > 0:
            dx = X_c[i] - X_c[i - 1]
            Ah += dh * dx
        
        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i
            
    Ah = Ah * 2

    #_P_ 3. Aplicación del Modelo de Ekelund Clásico (Estable para grandes reducciones)
    H0_eq = A0 / W0 if W0 > 0 else 0
    dH_eq = Ah / W0 if W0 > 0 else 0
    h1_eq = max(0.1, H0_eq - dH_eq)  #_P_ Evitar división por cero
    
    y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
    R_eff = R_nom - y_c_media
    
    #_P_ --- CÁLCULO DEL ÁNGULO DE MORDEDURA ---
    cos_angulo = 1 - (dH_eq / (2 * R_eff)) if R_eff > 0 else 1
    cos_angulo = max(-1.0, min(1.0, cos_angulo))
    angulo_mordedura_rad = math.acos(cos_angulo)
    angulo_mordedura_deg = angulo_mordedura_rad * (180 / math.pi)
    
    m_eq = (1.6 * mu * math.sqrt(max(0.0, R_eff * dH_eq))) / (H0_eq + h1_eq) if (H0_eq + h1_eq) > 0 else 0
    
    numerador = m_eq * dH_eq * math.sqrt(max(0.0, R_eff * dH_eq))
    denominador = H0_eq + m_eq * h1_eq
    delta_b = (numerador / denominador) if denominador > 0 else 0.0

    #_P_ 4. Restricción física del canal
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0
    half_W1_calculado = (W0 + delta_b) / 2
    
    half_W1 = min(half_W1_calculado, half_W_canal_max)

    #_P_ Función auxiliar por defecto para interpolar Y si no se provee externamente
    def default_interpolar_y(perfil, x_val):
        xs = perfil["X"]
        ys = perfil["Y"]
        if x_val <= xs[0]:
            return ys[0]
        if x_val >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= x_val <= xs[i + 1]:
                t = (x_val - xs[i]) / (xs[i + 1] - xs[i])
                return ys[i] + t * (ys[i + 1] - ys[i])
        return ys[-1]

    interpolar_y = interpolar_y_func if interpolar_y_func is not None else default_interpolar_y

    #_P_ 5. Construcción de la matriz de puntos de salida
    X_out = []
    Y_out = []

    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ --- Zona Libre / Abombamiento Lateral ---
    if half_W1 > x_cont:
        dx_libre = (half_W1 - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1 - x_cont)
            
            #_P_ Curva parabólica de abombamiento
            y_parabola = y_cont - (y_cont - half_g) * (t ** 2)
            
            #_P_ Recorte contra el perfil del canal
            y_canal_max = interpolar_y({"X": X_c, "Y": Y_luz}, x)
            y_final = min(y_parabola, y_canal_max)
            y_final = max(half_g, y_final)  #_P_ Evitar bajar de la luz

            X_out.append(x)
            Y_out.append(y_final)

    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]

    return {
        "X": X_out,
        "Y": Y_out
    }


def generar_perfil_salida_shinokura_3(perfil_cilindro, P_in, g, R_nom, alpha=0.85, n_puntos_libre=25, calcular_area_desde_puntos=None, interpolar_y_func=None):
    """
    Genera el perfil de salida usando el modelo de Shinokura y Takai.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de W0 y A0 desde el primer cuadrante
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)

    #_P_ 2. Cálculo de dimensiones equivalentes (Alturas medias)
    H0_media = A0 / W0 if W0 > 0 else 0  #_P_ Altura media geométrica del material de entrada
    H_rodillo_max = 2 * np.max(Y_c) if len(Y_c) > 0 else 0  #_P_ Altura máxima del hueco del rodillo
    
    #_P_ Reducción de altura equivalente
    dH_eq = max(0.0, H0_media - H_rodillo_max)
    
    #_P_ Área reducida (Área del material que se deforma contra el rodillo)
    Ah = max(0.0, A0 - (W0 * H_rodillo_max))

    #_P_ 3. Aplicación del Modelo de Shinokura y Takai
    y_c_media = np.max(Y_c) / 2 if len(Y_c) > 0 else 0
    R_eff = R_nom - y_c_media  #_P_ Radio efectivo

    #_P_ --- CÁLCULO DEL ÁNGULO DE MORDEDURA ---
    cos_angulo = 1.0 - (dH_eq / (2 * R_eff)) if R_eff > 0 else 1.0
    cos_angulo = max(-1.0, min(1.0, cos_angulo)) 
    angulo_mordedura_deg = math.acos(cos_angulo) * (180 / math.pi)

    #_P_ Cálculo del ensanchamiento según Shinokura
    factor_geometria = math.sqrt(max(0.0, R_eff * dH_eq)) / (W0 + 0.5 * H0_media) if (W0 + 0.5 * H0_media) > 0 else 0
    W1 = W0 * (1.0 + alpha * (Ah / A0) * factor_geometria) if A0 > 0 else W0
    half_W1 = W1 / 2
    
    #_P_ Restricción física del ancho del rodillo
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0                          
    half_W1_efectivo = min(half_W1, half_W_canal_max)  

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out)
    X_out = []
    Y_out = []

    #_P_ Buscar hasta dónde llega la zona de contacto real (donde la parábola tocaría el rodillo)
    idx_contacto = 0
    for i in range(len(X_c)):
        if X_c[i] <= half_W1_efectivo:
            idx_contacto = i
        else:
            break

    #_P_ --- Zona de Contacto con el Calibre ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ Función auxiliar por defecto para interpolar Y si no se provee externamente
    def default_interpolar_y(perfil, x_val):
        xs = perfil["X"]
        ys = perfil["Y"]
        if x_val <= xs[0]:
            return ys[0]
        if x_val >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= x_val <= xs[i + 1]:
                t = (x_val - xs[i]) / (xs[i + 1] - xs[i])
                return ys[i] + t * (ys[i + 1] - ys[i])
        return ys[-1]

    interpolar_y = interpolar_y_func if interpolar_y_func is not None else default_interpolar_y

    #_P_ --- Zona Libre / Abombamiento Lateral (Free Surface Bulging) ---
    if half_W1_efectivo > x_cont:
        dx_libre = (half_W1_efectivo - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1_efectivo - x_cont)
            
            #_P_ Parábola natural de abombamiento
            y_parabola = y_cont - (y_cont - half_g) * (t ** 2)
            
            #_P_ Altura del rodillo en ese punto X (usando interpolación segura)
            y_canal_max = interpolar_y({"X": X_c, "Y": Y_luz}, x)

            #_P_ Si el acero intenta salirse del rodillo, se ciñe a él (no lo atraviesa)
            y_final = min(y_parabola, y_canal_max)
            y_final = max(half_g, y_final) #_P_ No bajar de la luz

            X_out.append(x)
            Y_out.append(y_final)

    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]        

    return {
        "X": X_out,
        "Y": Y_out
    }



def generar_perfil_salida_shinokura_2(perfil_cilindro, P_in, g, R_nom, alpha=0.85, n_puntos_libre=25, calcular_area_desde_puntos=None, interpolar_y_func=None):
    """
    Genera el perfil de salida usando el modelo de Shinokura y Takai.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de W0 y A0 desde el primer cuadrante
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)

    #_P_ Función interna para consultar la altura de entrada interpolando los puntos
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1]

    #_P_ 2. Generación de puntos de la diferencia (dh) para calcular el Ah total de forma modular
    X_dh = []
    Y_dh = []
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break

        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        X_dh.append(x)
        Y_dh.append(dh)  #_P_ Almacenamos la diferencia de altura temporalmente en Y

        #_P_ Detección de contacto físico con el calibre cerrado
        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i

    X_dh = np.array(X_dh)
    Y_dh = np.array(Y_dh)

    #_P_ Obtenemos el Ah total mediante la integración trapezoidal reutilizada
    if calcular_area_desde_puntos is not None:
        Ah = calcular_area_desde_puntos(X_dh, Y_dh)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        Ah = trapz_func(Y_dh, X_dh) if trapz_func else np.sum((Y_dh[:-1] + Y_dh[1:]) * np.diff(X_dh) / 2)

    #_P_ ================== Hasta aquí común ambos modelos ==================

    #_P_ 3. Aplicación del Modelo de Shinokura y Takai para el ensanchamiento
    H0_eq = A0 / W0 if W0 > 0 else 0
    dH_eq = Ah / W0 if W0 > 0 else 0
    y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
    R_eff = R_nom - y_c_media  #_P_ Radio efectivo ponderado localmente

    factor_geometria = math.sqrt(max(0.0, R_eff * dH_eq)) / (W0 + 0.5 * H0_eq) if (W0 + 0.5 * H0_eq) > 0 else 0
    W1 = W0 * (1.0 + alpha * (Ah / A0) * factor_geometria) if A0 > 0 else W0
    half_W1 = W1 / 2

    #_P_ Restricción física del ancho del canal (para evitar que rebase el rodillo)
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0
    half_W1_efectivo = min(half_W1, half_W_canal_max)

    #_P_ ================== Hasta aquí común ambos modelos ==================

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    X_out = []
    Y_out = []

    #_P_ --- Zona de Contacto con el Calibre ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ Función auxiliar por defecto para interpolar Y si no se provee externamente
    def default_interpolar_y(perfil, x_val):
        xs = perfil["X"]
        ys = perfil["Y"]
        if x_val <= xs[0]:
            return ys[0]
        if x_val >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= x_val <= xs[i + 1]:
                t = (x_val - xs[i]) / (xs[i + 1] - xs[i])
                return ys[i] + t * (ys[i + 1] - ys[i])
        return ys[-1]

    interpolar_y = interpolar_y_func if interpolar_y_func is not None else default_interpolar_y

    #_P_ --- Zona Libre / Abombamiento Lateral (Free Surface Bulging) ---
    if half_W1_efectivo > x_cont:
        dx_libre = (half_W1_efectivo - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1_efectivo - x_cont)
            
            #_P_ Parábola natural de abombamiento
            y_parabola = y_cont - (y_cont - half_g) * (t ** 2)
            
            #_P_ Altura máxima del rodillo permitida en ese punto X
            y_canal_max = interpolar_y({"X": X_c, "Y": Y_luz}, x)
            
            #_P_ Restricción para que no atraviese el perfil del rodillo ni baje de la luz
            y_final = min(y_parabola, y_canal_max)
            y_final = max(half_g, y_final)

            X_out.append(x)
            Y_out.append(y_final)

    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]        

    #_P_ Devuelve estrictamente y únicamente el perfil laminado { X, Y } del primer cuadrante
    return {
        "X": X_out,
        "Y": Y_out
    }



def generar_perfil_salida_shinokura(perfil_cilindro, P_in, g, R_nom, alpha=0.85, n_puntos_libre=25, calcular_area_desde_puntos=None, interpolar_y_func=None):
    """
    Genera el perfil de salida usando el modelo de Shinokura y Takai.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de W0 y A0 desde el primer cuadrante
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)

    #_P_ Función auxiliar por defecto para interpolar Y si no se provee externamente
    def default_interpolar_y(perfil, x_val):
        xs = perfil["X"]
        ys = perfil["Y"]
        if x_val <= xs[0]:
            return ys[0]
        if x_val >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= x_val <= xs[i + 1]:
                t = (x_val - xs[i]) / (xs[i + 1] - xs[i])
                return ys[i] + t * (ys[i + 1] - ys[i])
        return ys[-1]

    interpolar_y = interpolar_y_func if interpolar_y_func is not None else default_interpolar_y

    #_P_ Función interna para consultar la altura de entrada usando interpolar_y con objeto
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        return 2 * interpolar_y({"X": X_in, "Y": Y_in}, x_abs)

    #_P_ 2. Generación de puntos de la diferencia (dh) para calcular el Ah total
    X_dh = []
    Y_dh = []
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break

        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        X_dh.append(x)
        Y_dh.append(dh)

        #_P_ Detección de contacto físico con el calibre cerrado
        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i

    X_dh = np.array(X_dh)
    Y_dh = np.array(Y_dh)

    #_P_ Obtenemos el Ah total mediante la integración trapezoidal
    if calcular_area_desde_puntos is not None:
        Ah = calcular_area_desde_puntos(X_dh, Y_dh)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        Ah = trapz_func(Y_dh, X_dh) if trapz_func else np.sum((Y_dh[:-1] + Y_dh[1:]) * np.diff(X_dh) / 2)

    #_P_ 3. Aplicación del Modelo de Shinokura y Takai para el ensanchamiento
    H0_eq = A0 / W0 if W0 > 0 else 0
    dH_eq = Ah / W0 if W0 > 0 else 0
    y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
    R_eff = R_nom - y_c_media  #_P_ Radio efectivo ponderado localmente

    factor_geometria = math.sqrt(max(0.0, R_eff * dH_eq)) / (W0 + 0.5 * H0_eq) if (W0 + 0.5 * H0_eq) > 0 else 0
    W1 = W0 * (1.0 + alpha * (Ah / A0) * factor_geometria) if A0 > 0 else W0
    half_W1 = W1 / 2

    #_P_ Límite físico máximo del ancho del canal
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0
    half_W1_efectivo = min(half_W1, half_W_canal_max)

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el 1er cuadrante
    X_out = []
    Y_out = []

    #_P_ --- Zona de Contacto con el Calibre ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ --- Zona Libre / Abombamiento Lateral con Restricción de Canal ---
    if half_W1_efectivo > x_cont:
        dx_libre = (half_W1_efectivo - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1_efectivo - x_cont)
            
            #_P_ Altura calculada por la parábola de abombamiento libre
            y_parabola = y_cont - (y_cont - half_g) * (t ** 2)

            #_P_ Interpolación de la altura máxima permitida por la canal en este punto x
            y_canal_max = interpolar_y({"X": X_c, "Y": Y_luz}, x)

            #_P_ RESTRICCIÓN FÍSICA: La altura nunca puede rebasar el perfil del rodillo
            y_final = min(y_parabola, y_canal_max)
            y_final = max(half_g, y_final)  #_P_ Evitar bajar de la luz mínima

            X_out.append(x)
            Y_out.append(y_final)

    #_P_ Truncamiento a 2 decimales coherente con el resto del proyecto
    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]

    #_P_ Devuelve estrictamente y únicamente el perfil laminado { X, Y } del primer cuadrante
    return {
        "X": X_out,
        "Y": Y_out
    }



def generar_perfil_salida_zheng(perfil_cilindro, P_in, g, R_nom, m_material=1.25, gamma=0.97, maxIter=3, n_puntos_libre=25, calcular_area_desde_puntos=None, interpolar_y_func=None):
    """
    Genera el perfil de salida usando el modelo iterativo de Zheng (2010) para aceros aleados.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    if calcular_area_desde_puntos is not None:
        A0 = calcular_area_desde_puntos(X_in, Y_in)
    else:
        trapz_func = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
        A0 = trapz_func(Y_in, X_in) if trapz_func else np.sum((Y_in[:-1] + Y_in[1:]) * np.diff(X_in) / 2)
        
    H0 = np.max(Y_in) * 2

    #_P_ Función interna para consultar la altura de entrada
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1]

    #_P_ 1. Integración numérica inicial para hallar Ah
    Ah = 0.0
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break
        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        if i > 0:
            dx = X_c[i] - X_c[i - 1]
            Ah += dh * dx
        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i
            
    Ah = Ah * 2

    #_P_ 2. Modelo Iterativo de Zheng (2010) para el ensanchamiento
    delta_b = 0.0
    H_mi = A0 / W0 if W0 > 0 else 0
    y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
    R_eff = R_nom - y_c_media

    for iter_idx in range(maxIter):
        term_raiz = math.sqrt(max(0.0, R_eff * max(0.1, H0 - H_mi)))
        denominador = W0 + 0.5 * H0
        factor_geometria = term_raiz / denominador if denominador > 0 else 0
        delta_b = m_material * gamma * factor_geometria * (Ah / A0) * W0 if A0 > 0 else 0
        
        #_P_ Actualización iterativa equivalente según Zheng
        W_temp = W0 + delta_b
        H_mi = A0 / W_temp if W_temp > 0 else 0

    W1 = W0 + delta_b
    half_W1 = W1 / 2
    half_W_canal_max = np.max(X_c) if len(X_c) > 0 else 0
    half_W1_efectivo = min(half_W1, half_W_canal_max)

    #_P_ Función auxiliar por defecto para interpolar Y si no se provee externamente
    def default_interpolar_y(perfil, x_val):
        xs = perfil["X"]
        ys = perfil["Y"]
        if x_val <= xs[0]:
            return ys[0]
        if x_val >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= x_val <= xs[i + 1]:
                t = (x_val - xs[i]) / (xs[i + 1] - xs[i])
                return ys[i] + t * (ys[i + 1] - ys[i])
        return ys[-1]

    interpolar_y = interpolar_y_func if interpolar_y_func is not None else default_interpolar_y

    #_P_ 3. Reconstrucción geométrica del perfil de salida
    X_out = []
    Y_out = []

    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    if half_W1_efectivo > x_cont:
        dx_libre = (half_W1_efectivo - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1_efectivo - x_cont)
            y_parabola = y_cont - (y_cont - half_g) * (t ** 2)
            y_canal_max = interpolar_y({"X": X_c, "Y": Y_luz}, x)

            y_final = min(y_parabola, y_canal_max)
            y_final = max(half_g, y_final)

            X_out.append(x)
            Y_out.append(y_final)

    def trunc_2(val):
        return math.trunc(val * 100) / 100

    return {
        "X": [trunc_2(v) for v in X_out],
        "Y": [trunc_2(v) for v in Y_out]
    }


def rotar_salida_a_entrada(salida_anterior):
    """
    Rota el perfil de salida de una caja 90° para que sirva correctamente 
    como entrada (P_in) de la siguiente caja, asegurando que los puntos 
    estén ordenados de forma ascendente y sin duplicados en X.
    """
    X_prev = np.array(salida_anterior["X"])
    Y_prev = np.array(salida_anterior["Y"])

    #_P_ Tomamos la referencia mínima en Y (la luz o semiancho del canal previo)
    min_y = np.min(Y_prev)

    #_P_ Mapeo correcto de ejes al rotar 90°:
    #_P_ - El nuevo ancho de entrada (x) viene de la altura anterior (Y_prev - min_y)
    #_P_ - La nueva altura de entrada (y) viene del ancho anterior (X_prev)
    puntos = []
    for i in range(len(X_prev)):
        puntos.append({
            "x": float(Y_prev[i] - min_y),
            "y": float(X_prev[i])
        })

    #_P_ Ordenar estrictamente de menor a mayor en X para la interpolación
    puntos.sort(key=lambda p: p["x"])

    #_P_ Filtrar duplicados en X para evitar divisiones por cero
    puntos_unicos = []
    for p in puntos:
        if len(puntos_unicos) == 0 or p["x"] != puntos_unicos[-1]["x"]:
            puntos_unicos.append(p)

    return {
        "X": [p["x"] for p in puntos_unicos],
        "Y": [p["y"] for p in puntos_unicos]
    }


def generar_perfil_salida_tafel_sedlaczek(perfil_cilindro, P_in, g, R_nom, n_puntos_libre=25, interpolar_y_func=None):
    """
    Genera el perfil de salida usando el modelo de Tafel y Sedlaczek.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de propiedades desde el primer cuadrante
    half_W0 = np.max(X_in)
    W0 = 2 * half_W0
    
    #_P_ Altura/espesor inicial de entrada máximo (2 veces la máxima altura del 1er cuadrante)
    H0 = 2 * np.max(Y_in) if len(Y_in) > 0 else 0
    Hout = g  #_P_ Espesor de salida de referencia en la luz

    #_P_ Función interna para consultar la altura de entrada interpolando los puntos
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1] if len(Y_in) > 0 else 0.0

    #_P_ 2. Integración numérica para hallar el área reducida (Ah) y detectar contacto
    Ah_cuadrante = 0.0
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break

        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        if i > 0:
            dx = X_c[i] - X_c[i - 1]
            Ah_cuadrante += dh * dx

        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i

    #_P_ 3. Aplicación de la fórmula de Tafel y Sedlaczek para el ensanchamiento
    dh_global = H0 - Hout
    delta_b = 0.0

    if dh_global > 0:
        y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
        R_eff = R_nom - y_c_media  #_P_ Radio efectivo ponderado localmente

        numerador = dh_global * W0 * math.sqrt(max(0.0, W0 * R_eff))
        denominador = 3 * ((W0 ** 2) + (H0 * Hout))
        
        delta_b = (numerador / denominador) if denominador != 0 else 0.0

    W1 = W0 + delta_b
    half_W1 = W1 / 2

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el primer cuadrante
    X_out = []
    Y_out = []

    #_P_ --- TRAMO A: Zona de Contacto ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ --- TRAMO B: Zona Libre / Abombamiento Lateral (Curva parabólica) ---
    if half_W1 > x_cont:
        dx_libre = (half_W1 - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1 - x_cont)
            y = y_cont - (y_cont - half_g) * (t ** 2)

            X_out.append(x)
            Y_out.append(y)
    
    #_P_ Función de truncamiento a 2 decimales coherente con el proyecto
    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]

    #_P_ Devuelve estrictamente el objeto { X, Y } del primer cuadrante para la siguiente etapa
    return {
        "X": X_out,
        "Y": Y_out
    }


def generar_perfil_salida_koncevicz(perfil_cilindro, P_in, g, R_nom, n_puntos_libre=25):
    """
    Genera el perfil de salida usando el modelo de Koncevicz.
    Recibe únicamente las coordenadas (X, Y) del primer cuadrante de entrada.
    """
    half_g = g / 2
    X_c = np.array(perfil_cilindro["X"])
    Y_c = np.array(perfil_cilindro["Y"])
    Y_luz = Y_c + half_g

    X_in = np.array(P_in["X"])
    Y_in = np.array(P_in["Y"])

    #_P_ 1. Cálculo automático de propiedades desde el primer cuadrante
    half_W0 = np.max(X_in) if len(X_in) > 0 else 0
    W0 = 2 * half_W0
    
    #_P_ Espesor/altura inicial de entrada (2 veces la altura máxima del 1er cuadrante)
    H0 = 2 * np.max(Y_in) if len(Y_in) > 0 else 0
    Hout = g  #_P_ Espesor de salida de referencia en la luz

    #_P_ Función interna para consultar la altura de entrada interpolando los puntos
    def obtener_altura_en(x):
        x_abs = abs(x)
        if x_abs > half_W0:
            return 0.0
        
        for i in range(len(X_in) - 1):
            if X_in[i] <= x_abs <= X_in[i + 1]:
                t = (x_abs - X_in[i]) / (X_in[i + 1] - X_in[i])
                return 2 * (Y_in[i] + t * (Y_in[i + 1] - Y_in[i]))
        return 2 * Y_in[-1] if len(Y_in) > 0 else 0.0

    #_P_ 2. Integración numérica para hallar el área reducida (Ah) y detectar contacto
    Ah_cuadrante = 0.0
    y_c_suma = 0.0
    n_contacto = 0
    idx_contacto = 0

    for i in range(len(X_c)):
        x = X_c[i]
        if x > half_W0:
            break

        H0_x = obtener_altura_en(x)
        Y_canal_total = 2 * Y_luz[i]
        dh = max(0.0, H0_x - Y_canal_total)
        
        if i > 0:
            dx = X_c[i] - X_c[i - 1]
            Ah_cuadrante += dh * dx

        if dh > 0:
            y_c_suma += Y_c[i]
            n_contacto += 1
            idx_contacto = i

    #_P_ 3. Aplicación de la fórmula de Koncevicz para el ensanchamiento
    dh_global = H0 - Hout
    delta_b = 0.0

    if dh_global > 0:
        y_c_media = (y_c_suma / n_contacto) if n_contacto > 0 else 0.0
        R_eff = R_nom - y_c_media  #_P_ Radio efectivo ponderado localmente

        #_P_ Δb = 0.66 * (Δh / (hin + hout)) * sqrt(Δh * R_eff)
        denominador_kon = H0 + Hout
        if denominador_kon > 0:
            delta_b = 0.66 * (dh_global / denominador_kon) * math.sqrt(max(0.0, dh_global * R_eff))

    W1 = W0 + delta_b
    half_W1 = W1 / 2

    #_P_ 4. Construcción de la matriz de puntos de salida (X_out, Y_out) en el primer cuadrante
    X_out = []
    Y_out = []

    #_P_ --- TRAMO A: Zona de Contacto ---
    for i in range(idx_contacto + 1):
        X_out.append(X_c[i])
        Y_out.append(Y_luz[i])

    x_cont = X_out[-1] if len(X_out) > 0 else 0
    y_cont = Y_out[-1] if len(Y_out) > 0 else half_g

    #_P_ --- TRAMO B: Zona Libre / Abombamiento Lateral (Curva parabólica) ---
    if half_W1 > x_cont:
        dx_libre = (half_W1 - x_cont) / n_puntos_libre

        for i in range(1, n_puntos_libre + 1):
            x = x_cont + i * dx_libre
            t = (x - x_cont) / (half_W1 - x_cont)
            y = y_cont - (y_cont - half_g) * (t ** 2)

            X_out.append(x)
            Y_out.append(y)

    #_P_ Función de truncamiento a 2 decimales coherente con el proyecto
    def trunc_2(val):
        return math.trunc(val * 100) / 100

    X_out = [trunc_2(x) for x in X_out]
    Y_out = [trunc_2(y) for y in Y_out]

    #_P_ Devuelve estrictamente el objeto { X, Y } del primer cuadrante listo para la rotación de 90°
    return {
        "X": X_out,
        "Y": Y_out
    }




