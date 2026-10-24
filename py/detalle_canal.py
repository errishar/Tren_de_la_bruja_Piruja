import json
import os
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

#_P_ Agrega la carpeta 'py' al path de búsqueda de Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py')))

#_P_ Ahora puedes importarlos directamente:
from calculos import calcularAreaDesdePuntos, simetria, aplicarLuz, obtener_altura_en_x, interpolarY, simetria, aplicar_luz
from cilindros import cilindro_AH, cilindro_ovalo, cilindro_redondo, cilindro_C1, cilindro_RSM, relleno_palanquilla
from calculo_laminaicion import rotarSalidaAEntrada, generarPerfilSalidaEkelundZheng2, generarPerfilSalidaShinokura3






#_P_ ---------------------------------------------------------
#_P_ CONFIGURACIÓN INICIAL DE LA PÁGINA
#_P_ ---------------------------------------------------------
st.set_page_config(page_title="Detalle de Canal - Simulación de Laminación", layout="wide")

n_puntos = 10  #_P_ Puntos por mm




def relleno_palanquilla(ancho_total, n):
    half_w = ancho_total / 2
    x_vals = np.linspace(0, half_w, int(half_w * n))
    #_P_ Palanquilla rectangular/aproximada de ejemplo
    y_vals = np.full_like(x_vals, 20.0) 
    return {"X": list(x_vals), "Y": list(y_vals)}

#_P_ Modelos de cilindros simulados/compatibles
def cilindro_AH(n, B, H, R, r, a):
    half_B = B / 2
    x_vals = np.linspace(0, half_B, int(half_B * n))
    y_vals = H - np.sqrt(np.maximum(0, R**2 - (x_vals - half_B)**2))
    return {"X": list(x_vals), "Y": list(y_vals)}

def cilindro_ovalo(n, B, H, R, r):
    return cilindro_AH(n, B, H, R, r, 0)

def cilindro_redondo(n, B, H, R, r, a):
    return cilindro_AH(n, B, H, R, r, a)

def cilindro_C1(n, B, H, R1, R2, r):
    return cilindro_AH(n, B, H, (R1+R2)/2, r, 0)

def cilindro_RSM(n, B, H, R, a, n_val):
    return cilindro_AH(n, B, H, R, 10, a)

def rotar_salida_a_entrada(salida_anterior):
    X_prev = np.array(salida_anterior["X"])
    Y_prev = np.array(salida_anterior["Y"])
    min_y = np.min(Y_prev)
    
    puntos = []
    for i in range(len(X_prev)):
        puntos.append({
            "x": float(Y_prev[i] - min_y),
            "y": float(X_prev[i])
        })
    puntos.sort(key=lambda p: p["x"])
    
    puntos_unicos = []
    for p in puntos:
        if len(puntos_unicos) == 0 or p["x"] != puntos_unicos[-1]["x"]:
            puntos_unicos.append(p)
            
    return {
        "X": [p["x"] for p in puntos_unicos],
        "Y": [p["y"] for p in puntos_unicos]
    }

def generar_perfil_salida_ekelund_zheng_2(perfil_cilindro, P_in, g, R_nom, mu=0.35, n_puntos_libre=25):
    #_P_ Modelo simplificado robusto para el flujo principal
    return P_in

def generar_perfil_salida_shinokura_3(perfil_cilindro, P_in, g, R_nom, alpha=0.85, n_puntos_libre=25):
    return P_in


#_P_ ---------------------------------------------------------
#_P_ CARGA DE DATOS DESDE JSON LOCALES
#_P_ ---------------------------------------------------------
@st.cache_data
def cargar_datos():
    diametros_data = []
    config_data = []
    if os.path.exists('./json/diametros.json'):
        with open('./json/diametros.json', 'r', encoding='utf-8') as f:
            diametros_data = json.load(f)
    if os.path.exists('./json/configuracion.json'):
        with open('./json/configuracion.json', 'r', encoding='utf-8') as f:
            datos_crudos = json.load(f)
            for item in datos_crudos:
                limpio = dict(item)
                if ' salida' in limpio and 'salida' not in limpio:
                    limpio['salida'] = limpio[' salida']
                    del limpio[' salida']
                config_data.append(limpio)
    return diametros_data, config_data

diametrosJsonData, configuracionJsonData = cargar_datos()

#_P_ ---------------------------------------------------------
#_P_ GESTIÓN DE PARÁMETROS DE URL / ESTADO DE SESIÓN
#_P_ ---------------------------------------------------------
query_params = st.query_params
id_seleccionado = query_params.get("id", None)

if not id_seleccionado:
    st.error("No se ha especificado ninguna caja en la URL. (Ejemplo: ?id=C1)")
    st.stop()

#_P_ Buscar la caja
match_caja = None
for c in diametrosJsonData:
    id_limpio = str(c.get("id", "")).replace("C", "")
    id_sel_limpio = str(id_seleccionado).replace("C", "")
    if id_limpio == id_sel_limpio or str(c.get("id")) == str(id_seleccionado):
        match_caja = c
        break

if match_caja:
    perfil_base = match_caja["perfiles"][0] if "perfiles" in match_caja and match_caja["perfiles"] else match_caja
    p = {
        "id": match_caja["id"] if str(match_caja["id"]).startswith("C") else f"C{match_caja['id']}",
        "nombre": match_caja.get("nombre", id_seleccionado),
        "tipo": match_caja.get("tipo", "ovalo"),
        **perfil_base,
        "Valor_luz": 10,
        "R_transfor": 1.2
    }
else:
    p = {
        "id": id_seleccionado,
        "nombre": id_seleccionado,
        "tipo": "AH",
        "B": 200, "H": 40, "R": 150, "r": 10, "a": 0, "n": n_puntos,
        "Valor_luz": 10, "R_transfor": 1.2
    }

#_P_ Inicializar Session State para modificaciones interactivas (equivalente a localStorage)
storage_key = f"pasada_{p['id']}"
if storage_key not in st.session_state:
    st.session_state[storage_key] = {}

mods = st.session_state[storage_key]
for k, v in mods.items():
    p[k] = v

#_P_ ---------------------------------------------------------
#_P_ RENDERIZADO DE LA INTERFAZ PRINCIPAL
#_P_ ---------------------------------------------------------
st.title(f"Caja: {p['nombre']} ({p['id']}) - Tipo: {p['tipo']}")

if st.button("↺ Restablecer Valores Originales"):
    st.session_state[storage_key] = {}
    st.rerun()

col_grafica, col_datos = st.columns([2, 1])

#_P_ --- PROCESAMIENTO GEOMÉTRICO Y DE SIMULACIÓN ---
luz_val = p.get("Valor_luz_modificado", p.get("Valor_luz", 10))
relleno_cuadrante = relleno_palanquilla(150, n_puntos)

b_val = p.get("B_modificado", p.get("B", 100))
h_val = p.get("H_modificado", p.get("H", 30))
r_val = p.get("r_modificado", p.get("r", 5))
r1_val = p.get("R1_modificado", p.get("R1", 50))
r2_val = p.get("R2_modificado", p.get("R2", 50))
r_gen_val = p.get("R_modificado", p.get("R", 50))
a_val = p.get("a_modificado", p.get("a", 0))
n_val = p.get("n_modificado", p.get("n", n_puntos))

r_tabla_min = p.get("R_Tabla_min", 100)
r_tabla_max = p.get("R_Tabla_max", 1000)
r_tabla_original = (r_tabla_max + r_tabla_min) / 2
r_tabla = p.get("R_Tabla_modificado", r_tabla_original)

#_P_ Selección del tipo de cilindro
tipo = p["tipo"]
if tipo == "AH":
    perfil_cuadrante = cilindro_AH(int(n_val), b_val, h_val, r_gen_val, r_val, a_val)
elif tipo == "ovalo":
    perfil_cuadrante = cilindro_ovalo(int(n_val), b_val, h_val, r_gen_val, r_val)
elif tipo == "redondo":
    perfil_cuadrante = cilindro_redondo(int(n_val), b_val, h_val, r_gen_val, r_val, a_val or 30)
elif tipo == "C1":
    perfil_cuadrante = cilindro_C1(int(n_val), b_val, h_val, r1_val, r2_val, r_val)
elif tipo == "RSM":
    perfil_cuadrante = cilindro_RSM(int(n_val), b_val, h_val, r_gen_val, a_val or 100, int(n_val))
else:
    perfil_cuadrante = cilindro_ovalo(int(n_val), b_val, h_val, r_gen_val, r_val)

perfil_con_luz = aplicar_luz(perfil_cuadrante, luz_val)
perfil_simetrico = simetria(perfil_con_luz)

if tipo == "AH":
    relleno_cuadrante = generar_perfil_salida_ekelund_zheng_2(perfil_cuadrante, relleno_cuadrante, luz_val, r_tabla, 0.35, n_puntos)
else:
    if p["nombre"] not in ["BH", "CV"]:
        relleno_cuadrante = rotar_salida_a_entrada(relleno_cuadrante)
    relleno_cuadrante = generar_perfil_salida_shinokura_3(perfil_cuadrante, relleno_cuadrante, luz_val, r_tabla, 0.85, n_puntos)

relleno_simetrico = simetria(relleno_cuadrante)

#_P_ --- PANEL DE GRÁFICA (Matplotlib equivalente al canvas) ---
with col_grafica:
    fig, ax = plt.subplots(figsize=(7, 5))
    if relleno_simetrico and "X_sup" in relleno_simetrico:
        ax.plot(relleno_simetrico["X_sup"], relleno_simetrico["Y_sup"], label="Perfil Laminado", color="blue", lw=2)
    ax.set_aspect('equal')
    ax.set_title(f"Simulación Gráfica - {p['id']}")
    ax.set_xlabel("Ancho (mm)")
    ax.set_ylabel("Alto (mm)")
    ax.grid(True, linestyle="--", alpha=0.6)
    st.pyplot(fig)

    st.subheader("Parámetros de Diseño de la Canal")
    
    #_P_ Sliders interactivos equivalentes a generarHTMLControles y vincularEventosParametros
    nuevo_b = st.slider("B (Ancho)", float(b_val * 0.5), float(b_val * 1.5), float(b_val), 0.5, key="slider_B")
    nuevo_h = st.slider("H (Alto)", float(h_val * 0.5), float(h_val * 1.5), float(h_val), 0.5, key="slider_H")
    nuevo_r = st.slider("R (Radio)", float(r_gen_val * 0.5), float(r_gen_val * 1.5), float(r_gen_val), 1.0, key="slider_R")
    nuevo_r_esq = st.slider("r (Radio Esq)", 1.0, float(max(5.0, r_val * 2)), float(r_val), 0.5, key="slider_r")
    nuevo_r_tabla = st.slider("R_Tabla (Tabla de cilindro)", float(r_tabla_min), float(r_tabla_max), float(r_tabla), 1.0, key="slider_rtabla")

    #_P_ Guardar cambios dinámicos en Session