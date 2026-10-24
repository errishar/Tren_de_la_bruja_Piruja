import numpy as np
import math
#_P_ Agrega la carpeta 'py' al path de búsqueda de Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py')))

#_P_ Ahora puedes importarlos directamente:
from calculos import calcularAreaDesdePuntos, simetria, aplicarLuz



def cilindro_AH(n, B, H, R, r, a_deg):
    factor = 0.25
    
    a_rad = math.radians(a_deg)          #_P_ Ángulo en radianes
    half_B = B / 2

    #_P_ 1. Centro del arco inferior r
    x_cr = half_B
    y_cr = r

    #_P_ 2. Punto exacto de inicio de r (Tangencia con la recta)
    x3_fin = x_cr - r * math.sin(a_rad)
    y_tan_r = y_cr - r * math.cos(a_rad)

    #_P_ 3. Geometría del arco superior R
    y_cR = H - R
    y_tan_R = y_cR + R * math.cos(a_rad)
    
    #_P_ Distancia horizontal entre tangencias usando la pendiente
    delta_y = y_tan_R - y_tan_r
    delta_x = delta_y * math.tan(a_rad)

    x2_fin = x3_fin - delta_x
    x_cR = x2_fin - R * math.sin(a_rad)
    if x_cR < 0:
        x_cR = 0

    x1_fin = x_cR
    n_puntos = int(half_B * n * factor)
    if n_puntos < 2:
        n_puntos = 2

    #_P_ --- TRAMO 1: Parte plana superior (Y = H) ---
    X1 = np.linspace(0, x1_fin, n_puntos)
    Y1 = np.full_like(X1, H)

    #_P_ --- TRAMO 2: Arco de empalme R ---
    X2 = np.linspace(x1_fin, x2_fin, n_puntos)
    Y2 = y_cR + np.sqrt(np.maximum(0, R**2 - (X2 - x_cR)**2))

    #_P_ --- TRAMO 3: Recta inclinada ---
    X3 = np.linspace(x2_fin, x3_fin, n_puntos)
    if x3_fin != x2_fin:
        t = (X3 - x2_fin) / (x3_fin - x2_fin)
    else:
        t = np.zeros_like(X3)
    Y3 = y_tan_R - t * delta_y

    #_P_ --- TRAMO 4: Arco r desde el punto de tangencia hasta (B/2, 0) ---
    X4 = np.linspace(x3_fin, half_B, n_puntos)
    val = r**2 - (X4 - x_cr)**2
    Y4 = y_cr - np.sqrt(np.maximum(0, val))

    #_P_ --- TRAMO 5: Cuello plano exterior a nivel Y = 0 ---
    n_puntos_5 = int(n_puntos * factor)
    if n_puntos_5 < 2:
        n_puntos_5 = 2
    X5 = np.linspace(half_B, half_B + 15, n_puntos_5)
    Y5 = np.zeros_like(X5)

    #_P_ Concatenar todos los tramos
    X = np.concatenate([X1, X2, X3, X4, X5])
    Y = np.concatenate([Y1, Y2, Y3, Y4, Y5])

    #_P_ Truncar/Redondear a 2 decimales y convertir a lista nativa si se desea
    X = np.round(X, 2)
    Y = np.round(Y, 2)

    return {"X": X.tolist(), "Y": Y.tolist()}

def cilindro_ovalo(n, B, H, R, r_fijo=None):
    #_P_ Cálculo del número de puntos adaptativo
    n = max(int(B / 2.0 * n), 25)
    x_final = B / 2.0

    #_P_ 1. Control de seguridad geométrica
    if R < x_final:
        R = x_final + 0.1

    #_P_ 2. Cálculo del ángulo alfa y del punto de tangencia
    sin_alfa = np.clip(x_final / R, 0.0, 1.0)
    alfa = np.arcsin(sin_alfa)
    cos_alfa = np.cos(alfa)

    #_P_ Coordenadas exactas del punto de tangencia
    xt = x_final
    yt = R * cos_alfa - (R - H)

    #_P_ 3. Despeje analítico del radio dependiente 'r' de suavizado
    divisor_r = 1.0 - cos_alfa
    if abs(divisor_r) < 1e-6:
        divisor_r = 1e-6

    r_calculado = yt / divisor_r
    r_calculado = max(0.5, r_calculado)  #_P_ Evitar colapsos a cero

    #_P_ 4. Determinación de los centros de los arcos
    xc1 = 0
    yc1 = H - R

    xc2 = (R + r_calculado) * sin_alfa
    yc2 = r_calculado

    #_P_ 5. CONSTRUCCIÓN DE LA MATRIZ DE PUNTOS (Primer Cuadrante)
    #_P_ Tramo 1: Arco Mayor (desde X=0 hasta la tangencia xt)
    X1 = np.linspace(0, xt, n)
    Y1 = yc1 + np.sqrt(np.maximum(0.0, R**2 - X1**2))

    #_P_ Tramo 2: Arco Menor (desde xt hasta el limite exterior xc2)
    x_limite_exterior = xc2
    X2 = np.linspace(xt, x_limite_exterior, n)
    Y2 = yc2 - np.sqrt(np.maximum(0.0, r_calculado**2 - (X2 - xc2)**2))

    #_P_ Combinamos las curvas en una sola matriz continua
    Xi = np.concatenate([X1, X2])
    Yi = np.concatenate([Y1, Y2])

    #_P_ 6. FILTRADO Y AJUSTE MILIMÉTRICO DE EXTREMOS
    Xi_filt = []
    Yi_filt = []

    for x_val, y_val in zip(Xi, Yi):
        if x_val >= 0 and y_val >= 0 and y_val <= H:
            Xi_filt.append(x_val)
            Yi_filt.append(y_val)

    if len(Xi_filt) > 0:
        Yi_filt[0] = H  #_P_ Cresta inicial en X=0
        Xi_filt[-1] = x_limite_exterior
        Yi_filt[-1] = 0.0  #_P_ Muere en cota cero

    #_P_ Redondear a 2 decimales
    Xi_filt = [round(x, 2) for x in Xi_filt]
    Yi_filt = [round(y, 2) for y in Yi_filt]

    return {
        "X": Xi_filt,
        "Y": Yi_filt
    }

def cilindro_redondo(n=100, B=120.09, H=49, R=55, r=8, a=30):
    alfa = math.radians(a)  #_P_ Angulo ti panagtitikor iti radianes
    n = max(int(B / 2 * n), int(B / 2))

    #_P_ 1. TÉRMINO GEOMÉTRICO DE TRANSLACIÓN
    term_recta = ((H - R) + R * math.sin(alfa) - r * (1 - math.sin(alfa))) / math.tan((math.pi / 2) - alfa)

    #_P_ 2. PUNTOS CRÍTICOS EN X DE TANGENCIA
    x_T1 = 0.0
    x_T2 = -R * math.cos(alfa)
    x_T3 = x_T2 - term_recta
    x_T4 = -B / 2  #_P_ Eksakto nga ngudo ti base

    #_P_ 3. CENTRO DEL ARCO DE ACUERDO LATERAL r
    cx_C2 = -term_recta - (R + r) * math.cos(alfa)

    #_P_ 4. MUESTREO Y ECUACIONES DE LOS TRAMOS
    
    #_P_ Tramo 1: Arco Superior Central (manipud x_T1 agingga x_T2)
    X1 = np.linspace(x_T1, x_T2, n)
    Y1 = (H - R) + np.sqrt(np.maximum(0, R**2 - X1**2))

    #_P_ Tramo 2: Recta Inclinada de Transición (manipud x_T2 agingga x_T3)
    X2 = np.linspace(x_T2, x_T3, n)
    Y2 = (H - R) + R * math.sin(alfa) + math.tan((math.pi / 2) - alfa) * (X2 + R * math.cos(alfa))

    #_P_ Tramo 3: Arco Inferior de Esquina r (manipud x_T3 agingga x_T4)
    X3 = np.linspace(x_T3, x_T4, n)
    Y3 = r - np.sqrt(np.maximum(0, r**2 - (X3 - cx_C2)**2))

    if r == 0:
        X3 = np.array([])
        Y3 = np.array([])

    #_P_ 5. UNIÓN Y APLICACIÓN DE SIGNOS
    if r == 0:
        Xi = np.concatenate([X1, X2])
        Yi = np.concatenate([Y1, Y2])
    else:
        Xi = np.concatenate([X1, X2, X3])
        Yi = np.concatenate([Y1, Y2, Y3])

    #_P_ Pagbalinen a paiturturong dagiti coordinate iti umno a cuadrante babaen ti -Xi
    return {
        "X": (-Xi).tolist(),
        "Y": Yi.tolist()
    }

def cilindro_C1(n=100, B=140, H=35, R1=160, R2=40, r=8):
    #_P_ 1. Centros fijos según el plano técnico
    x_c1 = 0
    y_c1 = H - R1

    #_P_ Centro del radio de esquina r=8
    x_c3 = (B / 2) - r 
    y_c3 = r

    #_P_ 2. Obtener C2 usando calcularCentroC2 (se asume que esta función está definida en tu entorno)
    centros2 = calcularCentroC2(x_c1, y_c1, x_c3, y_c3, R1, R2, r)
    if not centros2 or len(centros2) < 2:
        return {"X": [], "Y": []}

    centro2 = centros2[0] if centros2[0]["y"] > centros2[1]["y"] else centros2[1]
    x_c2 = centro2["x"]
    y_c2 = centro2["y"]

    #_P_ 3. Puntos de tangencia exactos
    d1 = R1 - R2
    x_t12 = x_c1 + (x_c2 - x_c1) * (R1 / d1) if d1 != 0 else x_c1

    d3 = R2 + r
    x_t23 = x_c2 + (x_c3 - x_c2) * (R2 / d3) if d3 != 0 else x_c2

    #_P_ 4. Calcular el punto exacto X donde Y3 = 0 (truncado horizontal)
    x_corte_y0 = B / 2
    if r >= abs(y_c3):
        x_corte_y0 = x_c3 + math.sqrt(max(0, r**2 - y_c3**2))

    #_P_ Límites de integración truncados en x_corte_y0
    x_max = min(B / 2, x_corte_y0)
    x_m1 = max(0, min(x_t12, x_max))
    x_m2 = max(x_m1, min(x_t23, x_max))

    n_puntos = max(2, int((B / 2) * n / 3))

    #_P_ Tramo 1: Cresta superior (R1 = 160)
    X1 = np.linspace(0, x_m1, n_puntos)
    Y1 = y_c1 + np.sqrt(np.maximum(0, R1**2 - (X1 - x_c1)**2))

    #_P_ Tramo 2: Transición cóncava
    X2 = np.linspace(x_m1, x_m2, n_puntos)
    Y2 = y_c2 + np.sqrt(np.maximum(0, R2**2 - (X2 - x_c2)**2))

    #_P_ Tramo 3: Esquina (r = 8) truncada exactamente en Y = 0
    X3_raw = np.linspace(x_m2, x_max, n_puntos)
    X3 = []
    Y3 = []

    for x in X3_raw:
        val = r**2 - (x - x_c3)**2
        y = y_c3 - math.sqrt(max(0, val))

        #_P_ Trunca si el valor pasa de cero
        if y < 0:
            X3.append(x)
            Y3.append(0.0)
            break #_P_ Detiene la generación del trazado al tocar Y=0

        X3.append(x)
        Y3.append(y)

    #_P_ Combinar tramos
    X = np.concatenate([X1, X2, np.array(X3)])
    Y = np.concatenate([Y1, Y2, np.array(Y3)])

    #_P_ Redondear a 2 decimales
    X = [round(float(x), 2) for x in X]
    Y = [round(float(y), 2) for y in Y]

    return {"X": X, "Y": Y}



def cilindro_RSM(n, B, H, R, a, z):
    #_P_ Ángulo de inclinación en radianes (ajustado con a/2 según la lógica original)
    a_rad = (a / 2 * math.pi) / 180
    n = max(int(B / 2 * n), int(B / 2))
    
    #_P_ 1. Centro de la primera circunferencia
    x_c1 = 0
    y_c1 = H - R
    
    #_P_ 2. Centro de la segunda circunferencia
    d = R * (z - 1)
    x_c2 = -x_c1 - d * math.sin(a_rad)
    y_c2 = y_c1 - d * math.cos(a_rad)
    
    #_P_ 3. Punto de tangencia
    x_t1 = R * math.sin(a_rad)
    
    #_P_ Tramo 1: Arco Superior Central (de 0 a x_t1)
    X1 = np.linspace(0, x_t1, n)
    Y1 = y_c1 + np.sqrt(np.maximum(0.0, R**2 - (X1 - x_c1)**2))
    
    #_P_ Tramo 2: Arco de transición de la segunda circunferencia (de x_t1 a B/2)
    X2 = np.linspace(x_t1, B / 2, n)
    Y2 = y_c2 + np.sqrt(np.maximum(0.0, (z * R)**2 - (X2 - x_c2)**2))
    
    #_P_ Truncar los puntos donde Y2 sea menor o igual a 0
    X2_trunc = []
    Y2_trunc = []
    
    for x_val, y_val in zip(X2, Y2):
        if y_val > 0:
            X2_trunc.append(x_val)
            Y2_trunc.append(y_val)
        else:
            break
            
    #_P_ 4. Unión de tramos y aplicación de signos
    Xi = np.concatenate([X1, np.array(X2_trunc)])
    Yi = np.concatenate([Y1, np.array(Y2_trunc)])
    
    #_P_ Orientación de las coordenadas al cuadrante correcto cambiando el signo de X
    Xi = -Xi
    
    #_P_ Redondeo a 2 decimales para limpieza de datos
    Xi = [round(float(x), 2) for x in Xi]
    Yi = [round(float(y), 2) for y in Yi]
    
    return {
        "X": Xi,
        "Y": Yi
    }