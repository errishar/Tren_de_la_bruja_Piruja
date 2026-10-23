import numpy as np


def simetria(cuadrante):
    """Aplica simetría a los 4 cuadrantes a partir de datos del primer cuadrante.

    Parámetros:
    cuadrante (numpy.ndarray): Matriz 2D (2 filas) con puntos del 1er
    cuadrante. Fila 0 = X, Fila 1 = Y.

    Devuelve:
    numpy.ndarray: Matriz de salida con 3 filas:
                   Fila 0 -> Xt (X completas de izquierda a derecha)
                   Fila 1 -> Ysup (Y para cuadrantes superiores 1 y 2)
                   Fila 2 -> Yinf (Y para cuadrantes inferiores 3 y 4)
    """
    # 1. Extraer los centros (origen) de forma correcta
    x_centro = cuadrante[0, 0]
    y_centro = cuadrante[1, 0]

    # 2. Extraer el resto de los puntos (desde el índice 1 en adelante)
    X = cuadrante[0, 1:]
    Y = cuadrante[1, 1:]

    # 3. Construir el eje X completo
    Xt = np.concatenate([-X[::-1], [x_centro], X])

    # 4. Construir el eje Y Superior
    Ysup = np.concatenate([Y[::-1], [y_centro], Y])

    # 5. Construir el eje Y Inferior
    Yinf = -Ysup

    # 6. Empaquetar la salida
    Salida = np.array([Xt, Ysup, Yinf])

    return Salida


def calcularCentroC2(x1, y1, x3, y3, R1, R2, r):
    d1 = R1 - R2  # Distancia C1–C2 (tangencia interior)
    d3 = R2 + r   # Distancia C3–C2 (tangencia exterior)

    dx = x3 - x1
    dy = y3 - y1
    
    # Usamos np.hypot en lugar de math.hypot
    d = np.hypot(dx, dy)

    # Corregido: cambiamos 'null' por 'None' y usamos 'abs' nativo
    if d == 0 or d > (d1 + d3) or d < abs(d1 - d3):
        print("No existe intersección física real entre los radios.")
        return None  
    
    a = (d1 * d1 - d3 * d3 + d * d) / (2 * d)
    
    # Usamos np.sqrt en lugar de math.sqrt
    h = np.sqrt(d1 * d1 - a * a)

    # Punto base sobre la recta C1–C3
    x_p0 = x1 + (a / d) * dx
    y_p0 = y1 + (a / d) * dy

    # Vector unitario perpendicular a (C3 - C1)
    nx = -dy / d
    ny =  dx / d

    # Dos soluciones posibles
    x2_1 = x_p0 + h * nx
    y2_1 = y_p0 + h * ny

    x2_2 = x_p0 - h * nx
    y2_2 = y_p0 - h * ny

    # Corregido: Claves de diccionarios con comillas para Python
    return [
        { "x": x2_1, "y": y2_1 },
        { "x": x2_2, "y": y2_2 }
    ]


def interseccion_dos_circunferencias(x1, y1, R1, x2, y2, R2):
    # _p_ 1. Distancia entre centros (D)
    dx = x2 - x1
    dy = y2 - y1
    # Corregido: Paréntesis cerrado correctamente y cambiado Math.sqrt por np.sqrt
    D = np.sqrt(max(0.0, dx ** 2 + dy ** 2))

    # _P_ 2. Condición de existencia de solución real
    if D == 0:
        print("Centros coincidentes")
        return None
    
    if D > (R1 + R2) or D < abs(R1 - R2):
        print("Las circunferencias no se tocan")
        return None
    
    # _P_ 3. Proyección horizontal sobre la línea de centros (a)
    a = (R1 ** 2 - R2 ** 2 + D ** 2) / (2 * D)

    # _P_ 4. Distancia perpendicular al eje (h)
    h2 = R1 ** 2 - a ** 2
    h = np.sqrt(max(0.0, h2))

    # _P_ 5. Punto medio sobre la línea de centros (P_0)
    x0 = x1 + (a * dx) / D
    y0 = y1 + (a * dy) / D

    # _P_ 6. Puntos de intersección finales (P_1, P_2) 
    x_1 = x0 + (h * dy) / D
    y_1 = y0 - (h * dx) / D

    x_2 = x0 - (h * dy) / D
    y_2 = y0 + (h * dx) / D

    if h == 0:
        print("Son tangentes en un único punto")
        return {"x": x_1, "y": y_1}
    
    print("Existen dos puntos de intersección, buscando en el Cuadrante 1...")

    # _P_ Selección de la solución en el Cuadrante 1 (x >= 0, y >= 0)
    # Corregido: Limpieza de la sintaxis del if/elif/else y sangrados de Python
    if x_1 >= 0 and y_1 >= 0:
        return {"x": x_1, "y": y_1}
    elif x_2 >= 0 and y_2 >= 0:
        return {"x": x_2, "y": y_2}
    else:
        print("Ninguna intersección está en el cuadrante 1")
        return None


def interpolarY2(perfil, xVal):
    """
    Esta función realiza una interpolación lineal para encontrar el radio de 
    laminación local ($R$) que le corresponde a una coordenada $x$ específica 
    (xVal) dentro del perfil del cilindro.
    """
    X = perfil.X
    Y = perfil.Y

    # Corregido: En Python se usa len(X) en lugar de X.length
    if xVal <= X[0]: 
        return Y[0]
    if xVal >= X[len(X) - 1]: 
        return Y[len(Y) - 1]

    # _P_ Búsqueda del intervalo
    # Corregido: Añadidos los dos puntos ':' al final del for y del if
    for i in range(len(X) - 1):
        if xVal >= X[i] and xVal <= X[i + 1]:
            t = (xVal - X[i]) / (X[i + 1] - X[i])
            return Y[i] + t * (Y[i + 1] - Y[i])
        
    return Y[len(Y) - 1]


def interpolarY(perfil, xVal):
    X = perfil.X
    Y = perfil.Y

    # Control de array vacío
    if len(X) == 0: 
        return 0
        
    if xVal <= X[0]: 
        return Y[0]
        
    if xVal >= X[len(X) - 1]: 
        return Y[len(Y) - 1]

    for i in range(len(X) - 1):
        dx = X[i + 1] - X[i]
        
        # ← ÚNICO CAMBIO (Usa el abs nativo de Python)
        if abs(dx) < 1e-9: 
            continue   
            
        if xVal >= X[i] and xVal <= X[i + 1]:
            t = (xVal - X[i]) / dx
            return Y[i] + t * (Y[i + 1] - Y[i])
            
    return Y[len(Y) - 1]


def calcularAreaDesdePuntos(X, Y):
    """
    /**
    * Calcula el área transversal completa a partir de los puntos del 1er cuadrante
    * @param {Array<number>} X - Coordenadas X del perfil en el primer cuadrante
    * @param {Array<number>} Y - Coordenadas Y del perfil en el primer cuadrante
    * @returns {number} Área total considerando la simetría de los 4 cuadrantes
    */
    """
    #_P_ np.trapz calcula automáticamente la regla del trapecio
    A_cuadrante = np.trapz(Y, X)
    return abs(A_cuadrante) * 4#_P_ Multiplicado por 4 para los cuatro cuadrantes
    

def crearFuncionAltura(X_in, Y_in):
    """
    Genera una función de consulta de altura estandarizada a partir de un perfil (X, Y) del 1er cuadrante
    """
    #_P_Control de lista vacía para evitar errores con max()
    if len(X_in) == 0:
        half_W0 = 0
    else:
        #_P_ Corregido: Math.max(...X_in) se traduce como max(X_in) en Python
        half_W0 = max(X_in)
    
    #_P_ Definimos la función interna que se retornará
    def funcion_altura(x):
        x_abs = abs(x)
        if x_abs > half_W0 or len(X_in) == 0: 
            return 0
        
        #_P_ Interpolación lineal
        if x_abs <= X_in[0]: 
            return 2 * Y_in[0]
        if x_abs >= X_in[len(X_in) - 1]: 
            return 2 * Y_in[len(Y_in) - 1]

        for i in range(len(X_in) - 1):
            if x_abs >= X_in[i] and x_abs <= X_in[i + 1]:
                #_P_ Evitamos división por cero si hay puntos duplicados
                dx = X_in[i + 1] - X_in[i]
                if abs(dx) < 1e-9:
                    continue
                
                t = (x_abs - X_in[i]) / dx
                y_interp = Y_in[i] + t * (Y_in[i + 1] - Y_in[i])
                return 2 * y_interp  # Altura total simétrica
            
        return 0

    #_P_ Retornamos la función para poder usarla más tarde
    return funcion_altura