# Casar el simulador con PyRolL: mapeo, adaptador y resultados

Objetivo: usar [PyRolL](https://github.com/pyroll-project) (núcleo `pyroll-core` 3.1.15 + `pyroll-wusatowski-spreading` 3.0.0) como referencia física del simulador JS. Este documento recoge el mapeo de conceptos, la validación geométrica ejecutada y los resultados de la comparación. Scripts reproducibles en `pyroll_bridge/`.

## 1. Mapeo de conceptos

| Simulador JS | PyRolL | Notas |
|---|---|---|
| `cilindro_ovalo(n, B, H, R, r)` | `CircularOvalGroove(r1=r, r2=R, depth=H)` | Validado numéricamente (§2). Ojo: `r` del JSON se ignora en JS (se deriva `r_calculado`); PyRolL sí usa `r1`. |
| `cilindro_redondo(n, B, H, R, r, a)` | `GenericElongationGroove(r1=r, r2=R, depth=H, usable_width=B, flank_angle=π/2−a)` | Validado numéricamente (§2). |
| `cilindro_AH`, `cilindro_C1`, `cilindro_RSM` | `SplineGroove(contour_points, classifiers, usable_width=B)` | Mapeo universal por puntos de contorno (pendiente de validar). |
| `diametros.json` (B, H, R, r, a por caja) | geometría de cada `Groove` | Convenciones: en JS, `H` = **profundidad** del canal (Y=0 en la cara del rodillo) y `B` = ancho **total**; PyRolL usa las mismas convenciones. |
| `configuracion.json` (perfil → secuencia de cajas) | lista de `RollPass` + `Rotator` en `PassSequence` | La rotación 90° entre cajas equivale a la rotación automática de PyRolL (desactivable con `rotation=False`). |
| `config_luces_RS_resto.json` (luz, λ por caja y perfil) | `RollPass(gap=luz_en_m)` | No cargado hoy por `lamina_4.js` (usa luz=10 fija). |
| `generarPerfilsalidahinokura3` (Shinokura, α=0.85) | `pyroll-wusatowski-spreading` (plugin, ley de Wusatowski con exponente de dos regímenes) | Modelos distintos: las discrepancias son diferencias entre modelos, no errores de uno u otro sin referencia de planta. |
| `R_Tabla` = 550 mm | `Roll(nominal_radius=550e-3)` | Placeholder en ambos lados para la comparación "tal cual"; en SI (m). |
| `calcularAreaDesdePuntos` (×4 cuadrantes) | `Profile.cross_section.area` (polígono shapely) | Coherentes entre sí. |
| Rotación `rotarSalidaAEntrada` | `Rotator` / pre-procesador de `RollPass` | La de JS no conserva el área (H2 de la revisión); la de PyRolL sí. |

## 2. Validación geométrica (contornos, ejecutada)

Comparación del contorno del canal generado por el JS (`cilindro_ovalo` / `cilindro_redondo`) contra el contorno PyRolL en los puntos comunes (`pyroll_bridge/gen_contornos.mjs` + comparación en Python):

| Canal | Área de vacío por cuadrante (JS) | Área (PyRolL) | Desviación máx. de contorno | Desviación media |
|---|---|---|---|---|
| C2 óvalo (B=146.64, H=28, R=110, r=8) | 1407.42 mm² | 1407.91 mm² | 0.51 mm (punta del flanco) | 0.014 mm |
| C3 redondo (B=90.3, H=36, R=42.2, r=6, a=30°) | 1156.23 mm² | 1156.99 mm² | 0.065 mm | 0.011 mm |

**Conclusión: el mapeo geométrico óvalo→`CircularOvalGroove` y redondo→`GenericElongationGroove` es equivalente en la práctica** (desviación < 0.1% en área). El mapeo de AH, C1 y RSM vía `SplineGroove` queda pendiente de validar con el mismo procedimiento.

## 3. Arnés del motor JS (ejecutado)

`pyroll_bridge/js/cadena_completa.mjs` replica el núcleo de `lamina_4.js` sin DOM (perfil 8, salida 29, palanquilla 150, luz 10, R 550, α=0.85, μ=0.35, AH con EkelundZheng2 y el resto con Shinokura3, rotación antes de cada caja no-AH). Salidas: `cadena_js_resultados.json` (tabla por caja: W, H, área, λ, luz real del JSON), `cadena_js_contornos.json` (salidas), `cadena_js_entradas.json` (entradas tras rotación).

Resultado clave (perfil 8 "tal cual"):

- λ < 1 en C14, C18, C20 y C26 (el área de sección crece: requiere revisión, ver H4).
- Área final 109 mm² frente a las ~50.3 mm² del objetivo de 8 mm.
- Pasadas que no se resuelven en PyRolL bajo las hipótesis del modelo (C16 y C17, §4.2): el JS las calcula sin aviso con λ efectivos 0.57-0.61.

## 4. Comparación con PyRolL (ejecutada, adaptador corregido)

### 4.0 Correcciones del adaptador (importante para futuras sesiones)

La primera versión del puente contenía tres defectos que invalidaban los resultados iniciales ("PyRolL rechaza todas las pasadas"). Corregidos y verificados:

1. **Media sección**: el contorno JS es el primer cuadrante; el adaptador original solo espejaba en el eje x (x ≥ 0) → media sección, anchura y área a la mitad. Corregido: espejo en ambos ejes (4 cuadrantes), con prueba mínima (10×4 mm → 40 mm²) y chequeo de área contra \( 4 \times \) área del cuadrante.
2. **Doble rotación**: cada `RollPass` de PyRolL rota automáticamente su entrada 90° (igual que `rotarSalidaAEntrada` del JS). Para comparar una pasada aislada hay que usar la **entrada real del JS** (`cadena_js_entradas.json`, ya rotada) con `rotation=False`; así ambos motores calculan con la misma sección efectiva. (Alimentar la salida sin rotar hace que PyRolL rote sin perder área, mientras el JS rota perdiendo un 14%: las entradas efectivas difieren y la comparación no aísla los modelos.)
3. **Unidades**: el coeficiente de velocidad de Wusatowski (\( c_v = f(\delta) \cdot v + g(\delta) \)) mezcla unidades absolutas: exige \( v \) en m/s. Con mm el coeficiente da ~0.2 en lugar de ~1.0 y destruye el ensanchamiento. Solución: **SI completo** (m, Pa, K), como el test oficial de `pyroll-core`.

**Control positivo**: el test oficial `tests/test_solve_round_oval_round_spreading.py` de pyroll-core, ejecutado desde un directorio neutro contra la distribución instalada (pyroll-core 3.1.15 + plugin 3.0.0, verificado con `pyroll.core.__file__`): **1 passed**. Una variante propia con el plugin Wusatowski activo da resultados físicos coherentes (redondo 30 → óvalo 38.12×18 con filling 0.79; óvalo → redondo 24.02×25 con filling 0.96; rotación automática entre pasadas visible en las dimensiones de entrada). Nota: ejecutarlo desde el clon del repositorio prueba el árbol `main`, no la versión instalada.

### 4.1 Una pasada real de la cadena: C1 → C2 (comparación con entrada efectiva idéntica)

Entrada = **entrada real que recibe el motor JS** (`cadena_js_entradas.json["C2"]`, ya rotada por `rotarSalidaAEntrada`: 70.00 × 100.76 mm, área 6110.7 mm²), alimentada a PyRolL con `rotation=False` para que ambos motores calculen con la misma sección efectiva. Canal C2 óvalo (B=146.64, H=28, R=110, r=8), luz 10 (placeholder), R 550, tensión de flujo 100 MPa y 930 °C (supuestos del ensayo, no datos verificados del material) (`pyroll_bridge/una_pasada_C2.py`):

| Motor | W salida | H salida | Área | λ efectivo | filling |
|---|---|---|---|---|---|
| PyRolL + Wusatowski | 88.81 | 66.00 | 5256.0 | 1.163 | 0.605 |
| JS + Shinokura3 | 94.30 | 66.00 | 5566.3 | 1.098 | — |

La altura coincide exactamente (66 = abertura del canal). Enanchamiento observado: +18.81 mm (PyRolL) frente a +24.30 mm (JS) — Shinokura3 ensancha más que Wusatowski en esta pasada. Es una **diferencia observada entre implementaciones**: los dos modelos difieren en la ley de ensanchamiento, en la construcción de la superficie libre y en el rectángulo equivalente, así que la discrepancia no se puede atribuir en exclusiva a la ley sin referencia de planta. El λ "histórico" del arnés JS (1.279) se calculaba contra el área anterior a la rotación defectuosa (7118.6); el cociente efectivo es 6110.7/5566.3 = 1.098.

### 4.2 Pasadas que PyRolL no resuelve con la configuración "tal cual"

Con las entradas reales del JS (`rotation=False`) y los canales con luz placeholder 10:

- **C16** (`pyroll_bridge/una_pasada_C16_C17.py`): entrada 16.40 × 20.08 (área 241.9), abertura 21 → `entry_point` infinito. El solver falla porque el cambio de altura central es negativo (20.08 < 21). El JS calcula igual y entrega una salida de 421.9 mm² — un 74% más de área que la entrada (λ efectivo 0.573).
- **C17**: entrada 11.00 × 23.14 (área 190.4), abertura 24 → mismo fallo. El JS entrega 312.4 mm², un 64% más de área (λ efectivo 0.610).

Interpretación honesta: **el ensayo no se resuelve bajo las hipótesis geométricas del modelo** (dos rodillos simétricos con contacto en el calado); eso no constituye por sí solo una prueba de imposibilidad física del tren (el contacto real debe evaluarse contra el contorno local, no solo la altura central). Lo que sí está verificado es que el motor JS calcula estas pasadas sin aviso y con cocientes de área efectivos de 0.57-0.61, incompatibles con laminación con alargamiento.

### 4.3 Caso sintético C15 (resuelto en ambos motores, con entrada idéntica)

Entrada óvalo 17.5 × 30 (área 412.2) en la caja redonda C15 (B=20.78, H=8.2, R=9.8, luz 10, R 550), sin rotación en ambos motores (`pyroll_bridge/caso_sintetico_C15.py`):

| Motor | W salida | H salida | Área | λ |
|---|---|---|---|---|
| JS + Shinokura3 | 20.78 | 26.40 | 451.9 | **0.912** (el área crece) |
| PyRolL + Wusatowski | 18.55 | 26.40 | 406.7 | 1.013 |

Además, la instrumentación del motor JS (`calculo_laminación_instr.js`) registra que Shinokura3 **predijo** un semiancho de 13.57 mm (W = 27.14) contra un canal que solo admite 10.39 (B = 20.78): el ancho predicho excedía el canal en un 30% y el motor lo recortó en silencio (H3 demostrado con evidencia ejecutada). El caso es un sobrellenado real según la propia predicción del JS, enmascarado por el recorte, y con violación de conservación de área (λ = 0.912); PyRolL lo resuelve sin recorte y con λ ≥ 1.

## 5. Cómo reproducir

```bash
cd pyroll_bridge
pip install pyroll-core==3.1.15 pyroll-wusatowski-spreading==3.0.0   # + shapely, pytest
node js/cadena_completa.mjs        # cadena JS "tal cual" (perfil 8, salida 29)
python3 una_pasada_C2.py           # comparación C1→C2 con entrada efectiva idéntica (§4.1)
python3 una_pasada_C16_C17.py      # C16/C17: PyRolL no resuelve (§4.2)
python3 caso_sintetico_C15.py      # caso sintético C15 (§4.3)
node /tmp/h3_instr.mjs             # (instrumentación H3: ancho sin recorte)
```

Control positivo: copiar `tests/test_solve_round_oval_round_spreading.py` del [repo de pyroll-core](https://github.com/pyroll-project/pyroll-core) a un directorio neutro y ejecutar `pytest` ahí (desde el clon se prueba `main`, no la versión instalada).

Notas técnicas para futuras sesiones:

- El plugin Wusatowski registra `OutProfile.width`; sin modelo de pilares solo aplica si el ancho está fijado/en caché, y con `disk_element_count` usa el modelo de pilares. El núcleo por defecto da ancho = ancho útil (llenado completo).
- La rotación automática de 90° entre pasadas es la norma en PyRolL (`Rotator.rotation` por defecto 90); para comparar una entrada ya rotada por el JS, usar `rotation=False`.
- Unidades SI siempre: el coeficiente de velocidad de Wusatowski exige m/s (ver §4.0).
- El contorno de salida JS empieza en y = luz/2: extender paredes verticales hasta y = 0 al reconstruir la sección completa; los contornos pueden traer duplicados y micro-pliegues (limpieza + verificación de área).
- `Profile.from_groove(groove, filling=0.9, gap=10e-3)` genera entradas coherentes para arrancar cadenas.
- Faltan por mapear con validación: AH (`BoxGroove` candidato), C1 (`Oval3RadiiGroove` candidato), RSM (`SplineGroove`).

## 6. Conclusiones

1. La **correspondencia geométrica** óvalo→`CircularOvalGroove` y redondo→`GenericElongationGroove` está validada **en los dos canales ensayados** (C2 y C3, desviación < 0.1% en área); la generalización a otros canales queda pendiente (el JS ignora `r_fijo`, así que cada canal debe validarse individualmente).
2. El **puente funciona**: con entrada efectiva idéntica, la pasada C1→C2 se resuelve en ambos motores (PyRolL 88.81×66, λ 1.163 vs JS 94.30×66, λ 1.098 — Shinokura3 ensancha ~5.5 mm más). Es una diferencia observada entre implementaciones, no un veredicto sobre cuál es correcto.
3. Con la configuración "tal cual" (luz = 10 placeholder), PyRolL no resuelve C16 ni C17 (cambio de altura central negativo); el JS las calcula sin aviso con λ efectivos de 0.57-0.61 (el área de salida crece hasta un 74%). El caso sintético C15 se resuelve en ambos y demuestra H3 (recorte instrumentado: 27.14 mm predichos contra un canal de 20.78) y H4 (λ = 0.912).
4. Para una comparación completa del tren: (a) corregir H1–H4 en el motor JS, (b) cargar luces y radios reales por caja (H8), (c) re-ejecutar la cadena en ambos motores con la misma entrada.
