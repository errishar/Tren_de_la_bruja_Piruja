import json
import os
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

# ---------------------------------------------------------
# IMPORTACIÓN DE MÓDULOS LOCALES (Carpeta py/)
# ---------------------------------------------------------
from calculos import calcularAreaDesdePuntos, simetria, aplicarLuz, obtener_altura_en_x, interpolarY, simetria, aplicar_luz
from py.cilindros import (
    cilindro_AH, 
    cilindro_ovalo, 
    cilindro_redondo, 
    cilindro_C1, 
    cilindro_RSM, 
    relleno_palanquilla
)
from py.calculo_laminaicion import (
    generarPerfilSalidaEkelundZheng2, 
    generarPerfilSalidaShinokura3, 
    rotarSalidaAEntrada
)

# ---------------------------------------------------------
# CONFIGURACIÓN INICIAL DE LA PÁGINA STREAMLIT
# ---------------------------------------------------------
st.set_page_config(page_title="Simulación de Tren de Laminación", layout="wide")

n_puntos = 10  # Puntos por mm

# ---------------------------------------------------------
# CARGA DE DATOS DESDE JSON LOCALES
# ---------------------------------------------------------
@st.cache_data
def cargar_datos():
    diametros_data = []
    config_data = []
    
    path_diametros = './json/diametros.json'
    path_config = './json/configuracion.json'
    
    if os.path.exists(path_diametros):
        with open(path_diametros, 'r', encoding='utf-8') as f:
            diametros_data = json.load(f)
            
    if os.path.exists(path_config):
        with open(path_config, 'r', encoding='utf-8') as f:
            datos_crudos = json.load(f)
            for item in datos_crudos:
                limpio = dict(item)
                if ' salida' in limpio and 'salida' not in limpio:
                    limpio['salida'] = limpio[' salida']
                    del limpio[' salida']
                config_data.append(limpio)
                
    return diametros_data, config_data

diametrosJsonData, configuracionJsonData = cargar_datos()

# ---------------------------------------------------------
# MOTOR DE BÚSQUEDA Y GENERACIÓN DINÁMICA DE CAJAS
# ---------------------------------------------------------
def procesar_cajas_para_perfil(perfil_seleccionado, salida_seleccionada):
    array_p = []
    
    encontrado = next((item for item in configuracionJsonData if str(item.get("perfil")) == str(perfil_seleccionado)), None)
    if not encontrado:
        return array_p
        
    propiedades_salida = encontrado.get("salidas") or encontrado.get("salida")
    if not propiedades_salida:
        return array_p
        
    opciones_salida = list(propiedades_salida.keys())
    salida_usada = salida_seleccionada if salida_seleccionada and salida_seleccionada in opciones_salida else opciones_salida[0]
    array_cajas = propiedades_salida[salida_usada]
    
    if not isinstance(array_cajas, list):
        return array_p
        
    contador_id = 1
    for item_caja in array_cajas:
        nombre_caja = ""
        perfil_busqueda = perfil_seleccionado
        
        if isinstance(item_caja, str):
            nombre_caja = item_caja
        elif isinstance(item_caja, dict) and item_caja is not None:
            nombre_caja = item_caja.get("caja", "")
            if item_caja.get("perfil_cilindro"):
                perfil_busqueda = item_caja.get("perfil_cilindro")
                
        datos_encontrados = None
        
        # Búsqueda en la lista de diametros.json
        match_caja = None
        for c in diametrosJsonData:
            id_limpio = str(c.get("id", "")).replace("C", "")
            nombre_limpio = str(nombre_caja).replace("C", "")
            if id_limpio == nombre_limpio or str(c.get("id")) == str(nombre_caja):
                match_caja = c
                break
                
        if match_caja:
            perfiles_caja = match_caja.get("perfiles")
            if perfiles_caja and isinstance(perfiles_caja, list):
                match_perfil = next((p for p in perfiles_caja if str(p.get("perfil")) == str(perfil_busqueda) and p.get("variante", 1) == 1), None)
                if match_perfil:
                    caja_id = str(match_caja.get("id", ""))
                    datos_encontrados = {
                        "id": caja_id if caja_id.startswith("C") else f"C{caja_id}",
                        "nombre": match_caja.get("nombre", nombre_caja),
                        "tipo": match_caja.get("tipo", "ovalo"),
                        **match_perfil
                    }
            else:
                caja_id = str(match_caja.get("id", ""))
                datos_encontrados = {
                    "id": caja_id if caja_id.startswith("C") else f"C{caja_id}",
                    "nombre": match_caja.get("nombre", nombre_caja),
                    "tipo": match_caja.get("tipo", "ovalo"),
                    **match_caja
                }
                
        if datos_encontrados:
            array_p.append({
                "id": datos_encontrados.get("id") or f"C{contador_id}",
                "nombre": datos_encontrados.get("nombre") or f"Caja {nombre_caja}",
                "tipo": datos_encontrados.get("tipo", "ovalo"),
                "B": datos_encontrados.get("B", 100),
                "H": datos_encontrados.get("H", 30),
                "R": datos_encontrados.get("R") or datos_encontrados.get("R1", 50),
                "r": datos_encontrados.get("r", 1.5) if datos_encontrados.get("r") is not None else 1.5,
                "a": datos_encontrados.get("a", 0) if datos_encontrados.get("a") is not None else 0,
                "n": datos_encontrados.get("n", n_puntos) if datos_encontrados.get("n") is not None else n_puntos,
                "R1": datos_encontrados.get("R1"),
                "R2": datos_encontrados.get("R2"),
                "Valor_luz": 10,
                "R_transfor": 1.2
            })
        contador_id += 1
        
    return array_p

# ---------------------------------------------------------
# INTERFAZ DE USUARIO CON STREAMLIT
# ---------------------------------------------------------
st.title("Simulador de Tren de Laminación en Caliente")

# 1. Configuración de controles laterales (Sidebar)
st.sidebar.header("Parámetros de Entrada")

# Selección de Palanquilla
val_palanquilla = st.sidebar.radio("Diámetro de Palanquilla Inicial (mm):", [120, 150, 180], index=1)

# Selección de Perfil de Entrada
perfiles_disponibles = [item.get("perfil") for item in configuracionJsonData]
perfil_seleccionado = st.sidebar.selectbox("Selecciona Perfil Inicial:", ["-- Selecciona Perfil --"] + perfiles_disponibles)

salida_seleccionada = None
if perfil_seleccionado != "-- Selecciona Perfil --":
    encontrado = next((item for item in configuracionJsonData if str(item.get("perfil")) == str(perfil_seleccionado)), None)
    if encontrado:
        propiedades_salida = encontrado.get("salidas") or encontrado.get("salida")
        if propiedades_salida:
            opciones_salida = list(propiedades_salida.keys())
            if len(opciones_salida) > 1:
                salida_seleccionada = st.sidebar.selectbox("Tipo de Salida:", opciones_salida)
            elif len(opciones_salida) == 1:
                salida_seleccionada = opciones_salida[0]

# ---------------------------------------------------------
# PROCESAMIENTO Y RENDERIZADO DE PASADAS
# ---------------------------------------------------------
if perfil_seleccionado != "-- Selecciona Perfil --":
    lista_pasadas = procesar_cajas_para_perfil(perfil_seleccionado, salida_seleccionada)
    
    if not lista_pasadas:
        st.warning("No se encontraron cajas configuradas para este perfil y salida.")
    else:
        # Inicializar área de palanquilla
        rellenocuadrante = relleno_palanquilla(val_palanquilla, n_puntos)
        area_entrada_total = calcularAreaDesdePuntos(rellenocuadrante["X"], rellenocuadrante["Y"])
        
        # Iterar caja por caja en el tren de laminación
        for idx, p in enumerate(lista_pasadas):
            st.divider()
            st.subheader(f"Caja: {p['nombre']} ({p['id']}) - Tipo: {p['tipo']}")
            
            # Gestión de estado por pasada para modificaciones interactivas
            key_state = f"pasada_{p['id']}_{idx}"
            if key_state not in st.session_state:
                st.session_state[key_state] = {
                    "luz": p["Valor_luz"],
                    "r_trans": p["R_transfor"]
                }
                
            col1, col2 = st.columns([2, 1])
            
            with col2:
                st.markdown("### Controles de Pasada")
                luz_val = st.slider(f"Luz (mm) [{p['id']}]", 0.0, float(p["Valor_luz"] * 2), float(st.session_state[key_state]["luz"]), 0.1, key=f"slider_luz_{p['id']}_{idx}")
                r_trans_val = st.slider(f"R. Transformación [{p['id']}]", 0.5, 2.5, float(st.session_state[key_state]["r_trans"]), 0.01, key=f"slider_rt_{p['id']}_{idx}")
                
                st.session_state[key_state]["luz"] = luz_val
                st.session_state[key_state]["r_trans"] = r_trans_val
                
                if st.button(f"↺ Restablecer Caja {p['id']}", key=f"btn_rst_{p['id']}_{idx}"):
                    st.session_state[key_state]["luz"] = p["Valor_luz"]
                    st.session_state[key_state]["r_trans"] = p["R_transfor"]
                    st.rerun()

            # Obtener parámetros de geometría
            b_val = p["B"]
            h_val = p["H"]
            r_val = p["r"]
            r1_val = p.get("R1", 50)
            r2_val = p.get("R2", 50)
            r_gen_val = p["R"]
            a_val = p["a"]
            n_val = p["n"]
            r_tabla = (p.get("R_Tabla_min", 100) + p.get("R_Tabla_max", 1000)) / 2

            # Generación geométrica del cilindro según su tipo
            tipo_c = p["tipo"]
            if tipo_c == "AH":
                perfil_cuadrante = cilindro_AH(int(n_val), b_val, h_val, r_gen_val, r_val, a_val)
            elif tipo_c == "ovalo":
                perfil_cuadrante = cilindro_ovalo(int(n_val), b_val, h_val, r_gen_val, r_val)
            elif tipo_c == "redondo":
                perfil_cuadrante = cilindro_redondo(int(n_val), b_val, h_val, r_gen_val, r_val, a_val or 30)
            elif tipo_c == "C1":
                perfil_cuadrante = cilindro_C1(int(n_val), b_val, h_val, r1_val, r2_val, r_val)
            elif tipo_c == "RSM":
                perfil_cuadrante = cilindro_RSM(int(n_val), b_val, h_val, r_gen_val, a_val or 100, int(n_val))
            else:
                perfil_cuadrante = cilindro_ovalo(int(n_val), b_val, h_val, r_gen_val, r_val)

            perfil_con_luz = aplicar_luz(perfil_cuadrante, luz_val)
            
            # Cálculo de salida según modelo físico
            if tipo_c == "AH":
                mu = 0.35
                rellenocuadrante = generarPerfilSalidaEkelundZheng2(perfil_cuadrante, rellenocuadrante, luz_val, r_tabla, mu, n_puntos)
            else:
                if p["nombre"] not in ["BH", "CV"]:
                    rellenocuadrante = rotarSalidaAEntrada(rellenocuadrante)
                rellenocuadrante = generarPerfilSalidaShinokura3(perfil_cuadrante, rellenocuadrante, luz_val, r_tabla, 0.85, n_puntos)

            area_salida_total = calcularAreaDesdePuntos(rellenocuadrante["X"], rellenocuadrante["Y"])
            r_trans_calc = area_entrada_total / area_salida_total if area_salida_total > 0 else 0
            
            relleno_simetrico = simetria(rellenocuadrante)

            # Panel izquierdo: Gráfica matplotlib equivalente al canvas web
            with col1:
                fig, ax = plt.subplots(figsize=(6, 4))
                if relleno_simetrico and "X_sup" in relleno_simetrico:
                    ax.plot(relleno_simetrico["X_sup"], relleno_simetrico["Y_sup"], label="Perfil Laminado", color="blue", lw=2)
                ax.set_aspect('equal')
                ax.set_title(f"Perfil de Salida - {p['nombre']}")
                ax.set_xlabel("Ancho (mm)")
                ax.set_ylabel("Alto (mm)")
                ax.grid(True, linestyle="--", alpha=0.6)
                st.pyplot(fig)

            # Tabla de Datos de la Pasada
            st.markdown("#### Datos de la Pasada")
            x_vals = relleno_simetrico.get("X_sup", [0])
            y_vals = relleno_simetrico.get("Y_sup", [0])
            ancho_max = f"{max(x_vals)*2:.0f} mm" if x_vals else "0 mm"
            alto_max = f"{max(y_vals)*2:.0f} mm" if y_vals else "0 mm"

            data_tabla = {
                "Parámetro": ["Caja", "Tipo Cilindro", "Área Entrada", "Área Salida", "R. Transformación", "Luz", "Ancho de Figura", "Alto de Figura"],
                "Valor": [
                    p['id'],
                    tipo_c,
                    f"{area_entrada_total:.2f} mm²",
                    f"{area_salida_total:.2f} mm²",
                    f"{r_trans_calc:.2f} ({p['R_transfor']:.1f})",
                    f"{luz_val:.1f} ({p['Valor_luz']:.0f}) mm",
                    ancho_max,
                    alto_max
                ]
            }
            st.table(data_tabla)

            # Actualizar área de entrada para la siguiente pasada del tren
            area_entrada_total = area_salida_total
else:
    st.info("👈 Por favor, selecciona un perfil inicial en el panel lateral para iniciar la simulación del tren de laminación.")