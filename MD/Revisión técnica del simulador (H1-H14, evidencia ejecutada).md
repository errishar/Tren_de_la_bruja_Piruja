# Revisión técnica del simulador de diseño de pasadas de laminación

Estado: revisión estática + pruebas ejecutadas (arnés Node y PyRolL, ver `pyroll_bridge/`).
Fecha: 2026-10-24. Alcance: los 13 archivos entregados (réplica en `simulador_original/`), leídos al 100%.

El simulador calcula la secuencia completa palanquilla → AH → BH → CV → C1…C21 → C26…C29 para perfiles finales de 5 a 26.5 mm, con geometría de canales paramétrica, JSON de configuración por perfil, rotación de 90° entre cajas y varios modelos de ensanchamiento conmutables (Shinokura, Ekelund, Zheng, Tafel-Sedlaczek, Koncevicz). Los archivos fuente no se han modificado: todos los ensayos se ejecutan sobre copias en `pyroll_bridge/`.

---

## 1. Lo que está bien planteado

- **Estructura del rectángulo equivalente**: alturas medias \( \bar{H} = A/W \), radio efectivo, longitud de contacto \( \sqrt{R_{eff}\,\Delta\bar{H}} \) y área de calado \( A_h \) por integración numérica de \( dh(x) \) entre el perfil entrante y el contorno del canal. El espíritu de Lendl y Shinokura-Takai está correctamente planteado.
- **Separación de responsabilidades** geometría (`cilindro.js`) / cálculo (`calculo_laminación.js`) / configuración (JSON) / UI (`lamina_4.js`, `detalle_canal.js`): mantenible.
- **Configuración por perfil** (variantes de canal, secuencias con salida en 27 o 29 cajas, luces por perfil en `config_luces_RS_resto.json`): refleja la práctica real de un tren de alambrón.
- **Varios modelos de ensanchamiento conmutables**: útil para comparar.

---

## 2. Hallazgos (ruta activa: EkelundZheng2 en AH, Shinokura3 en el resto)

### H1 — Shinokura3 no es sensible a la luz (grave)
Por inspección del código, en `generarPerfilsalidahinokura3` las fórmulas de \( A_h \), \( dH_{eq} \) y \( W_1 \) dependen solo de `Y_c` (canal **sin** luz); la luz solo entra al final como traslación vertical de coordenadas. **Verificado ejecutando** en un caso particular (sin recorte, entrada 10×20 en el canal C15): con luces 2, 5 y 10 la anchura predicha es idéntica (W = 10.0000 en las tres) mientras la altura sí cambia (18.38 / 21.40 / 26.40 = abertura). Este ensayo no demuestra insensibilidad general (podría estar en una rama de ensanchamiento nulo o limitado), pero coincide con la inspección del código: la dependencia del calibre no existe en la fórmula. Además usa \( \bar{H}_0 = A_0/W_0 \) en el denominador, donde el paper original usa la altura máxima de entrada. Ver `pyroll_bridge/js/` (réplica del motor).

### H2 — La rotación no conserva la sección (grave)
En `rotarSalidaAEntrada` se resta `min_y` (= luz/2 de la caja anterior) a todas las ordenadas. La anchura total de la sección rotada queda subestimada en \( 2 \cdot min_y = luz \). **Verificado ejecutando**: la salida de C1 (área 7118.6 mm²) llega a C2 como entrada de 6110.7 mm² (−14%) y con 70 mm de anchura en lugar de 80. Además el filtrado de duplicados puede colapsar aristas verticales del contorno. Una rotación debe conservar el área e intercambiar anchura por altura.

### H3 — El sobrellenado queda enmascarado (grave)
`Math.min(half_W1, half_W_canal_max)` recorta la anchura predicha al ancho del canal de forma silenciosa. Una caja sobrellenada aparece como una sección "válida". **Verificado con instrumentación** (réplica instrumentada `calculo_laminación_instr.js`, caso sintético C15): Shinokura3 predijo un semiancho de 13.57 mm (W = 27.14) contra un canal que admite 10.39 (B = 20.78) — un 30.6% de exceso sobre el canal; el recorte elimina en silencio el 23.4% de la anchura predicha.

### H4 — Cocientes de área inferiores a 1 (grave)
El área de salida se construye desde el contorno (canal + parábola de superficie libre) y λ se calcula a posteriori; nada obliga \( A_{salida} < A_{entrada} \). **Verificado ejecutando la cadena completa** (perfil 8, salida 29, palanquilla 150, luz 10): λ < 1 en C14 (0.973), C18 (0.942), C20 (0.884) y C26 (0.758) — el área de sección **crece** al pasar por la caja. En laminación con alargamiento el cociente de áreas debe ser ≥ 1 (la conservación de masa se aplica a \( A \cdot v \) o \( A \cdot L \)); estos cocientes requieren revisión. Resultados completos en `pyroll_bridge/cadena_js_resultados.json`.

### H5 — C16/C17: PyRolL no resuelve bajo las hipótesis del ensayo y el JS calcula sin aviso (grave)
Con los valores por defecto de `lamina_4.js` (luz = 10 en todas las cajas, R = 550 mm), contrastando con PyRolL con entrada efectiva idéntica (ver `documentacion/mapeo_pyroll.md` §4):

- **C16 y C17 no se resuelven en PyRolL**: la entrada real de C16 (16.40 × 20.08) es más baja que la abertura del canal (21) y la de C17 (11.00 × 23.14) más baja que la suya (24). Que la altura central quede por debajo de la abertura central no descarta por sí solo contacto en los flancos, y que PyRolL no resuelva no demuestra imposibilidad física: PyRolL no converge en estas condiciones y devuelve un error de valor infinito en `entry_point`; este ensayo no determina por sí solo la causa física. El JS, en cambio, calcula igual y sin aviso, devolviendo secciones con un 74% y un 64% más de área que la entrada (λ efectivos 0.573 y 0.610).
- El motor JS no comprueba nada de esto: aplica las fórmulas igualmente y entrega una sección que llena exactamente la ventana del canal (W = B, H = abertura) aunque el área crezca.

Nota: una entrada más alta que la abertura NO es un defecto (es el calado normal de laminación); el contacto real debe evaluarse contra el contorno local del canal, no solo la altura central.

### H6 — La exención de rotación de BH/CV es código muerto (nuevo)
`lamina_4.js` (línea 282): `if (p.nombre !== "BH" && p.nombre !== "CV")` — pero `nombre` vale `"Caja BH"` / `"Caja CV"` en `diametros.json`, así que la condición nunca es falsa: **BH y CV también se rotan**, contra lo que el comentario del código intenta. La rotación entre AH→BH→CV debería revisarse contra el esquema real del tren. **`detalle_canal.js` (línea 143) replica el mismo patrón** con `p.nombre !== "BH" && p.nombre !== "CV"`.

### H7 — Variantes de canal inalcanzables (nuevo)
En `diametros.json`, las cajas C16, C17, C19, C20, … tienen variantes (variante 2, 3) con geometrías distintas, pero tanto `lamina_4.js` como `detalle_canal.js` toman la **primera** coincidencia (variante 1; `detalle_canal.js` además usa `perfiles[0]`, ignorando la geometría por perfil de salida). Las variantes ≥ 2 son datos muertos en la UI actual. Además, la búsqueda por `id` ignora el campo `variante`, con riesgo de selección errónea si se reordena el JSON.

### H8 — Placeholders globales
`R_Tabla` = 550 mm para **todas** las cajas (rango por defecto 100–1000), luz = 10 fija, `R_transfor` = 1.2 fijo. Los JSON de luces reales (`config_luces_RS_resto.json`, con luz y λ por caja y perfil) existen pero **`lamina_4.js` no los carga** (línea 99: `Valor_luz: 10` fijo). El radio afecta directamente al ensanchamiento vía \( \sqrt{R\,\Delta h} \).

### H9 — Controles duplicados y controles inoperantes
`index.html` carga `pasadas_copy.js` y `lamina_4.js`, y ambos registran eventos sobre `selectPerfil` y escriben `window.pasadas_55`: competencia entre inicializaciones. El control "R. Transformación" guarda el valor modificado pero el cálculo nunca lo consulta (λ siempre se recalcula como \( A_{in}/A_{out} \)).

### H13 — Vista de detalle: cálculo independiente, sin control de luz y parámetros leídos sin control (nuevo)
En `detalle_canal.js` el manejador de `Valor_luz` existe (línea 275) pero **ningún control lo emite**: los controles generados son solo B, H, R, r, a y R_Tabla, de modo que no hay control de luz en esta vista (aunque puede recuperar `Valor_luz_modificado` de localStorage). Los parámetros `R1`/`R2` (tipo C1) y `n` (tipo RSM) se leen y muestran en la tabla pero no tienen control deslizante. Además, la vista **no reproduce el estado de la pasada en la cadena**: la línea 102 arranca siempre de una palanquilla de 150 mm y calcula la caja seleccionada desde ella, no desde la salida de la caja anterior, y la línea 220 pasa `null` como relleno al gráfico. Es un cálculo independiente que hereda los defectos del motor (H1, H3) al llamar a `EkelundZheng2`/`Shinokura3` con `R_Tabla` por defecto 550.

### H14 — `grafica.js`: sin hallazgos adicionales en la revisión estática (nuevo)
Revisado al 100%: es solo renderizado (Chart.js). Construye el polígono de relleno cerrando el tramo superior con el inferior y mantiene escala proporcional con límites simétricos. Sin hallazgos adicionales en la revisión estática; únicamente detalles cosméticos (cursor `img/bruja.png`).

---

## 3. Hallazgos (variantes inactivas — bombas latentes)

### H10 — `generarPerfilSalidaEkelundZheng` produce NaN
`let delta_b = function(...){...}` define la función pero nunca la invoca; luego `(W0 + delta_b)/2` concatena objeto → NaN. Roto si se activa.

### H11 — Inconsistencia de escalado en Δb
`generarPerfilSalidaEkelund` usa `W1 = W0 + delta_b/2` mientras el resto usa `W1 = W0 + delta_b`. Si Δb es el ensanchamiento total (dos flancos), la primera lo parte a la mitad.

### H12 — Factor 2 en \( A_h \) (Ekelund v1, Shinokura v1/v2)
`calcularAreaDesdePuntos` multiplica por 4 (sección completa), pero esas variantes le pasan alturas **totales** integradas sobre el **semiancho**: \( 4\int_0^{W_0/2} dh\,dx = 2\times \) área de calado real → \( A_h/A_0 \) inflado al doble → ensanchamiento sobreestimado. No afecta por esa vía a `generarPerfilSalidaZheng` (su integral manual multiplica por 2 correctamente) ni a las variantes activas (`EkelundZheng2`, `Shinokura3`).

---

## 4. Caso sintético C15 (evidencia ejecutada, entrada idéntica en ambos motores)

Mismo canal redondo C15 (B=20.78, H=8.2, R=9.8, r=1.5, a=30°, luz 10, R 550) y misma entrada óvalo 17.5×30, sin rotación en ambos motores (`pyroll_bridge/caso_sintetico_C15.py`):

| Motor | W salida | H salida | Área | λ |
|---|---|---|---|---|
| JS + Shinokura3 | 20.78 (= B, recortado) | 26.40 (= abertura) | 451.9 | **0.912** (el área crece) |
| PyRolL + Wusatowski | 18.55 | 26.40 | 406.7 | 1.013 |

Ambos motores resuelven la pasada. El JS recorta el ancho predicho (27.14 mm instrumentados) al canal (20.78) en silencio y entrega más área que la entrada (H3 + H4); PyRolL calcula sin recorte con λ ≥ 1.

---

## 5. Metodología y fuentes

- Atribución "Zheng et al. (2010)" con \( m = 1.28 \) (GCr15): **no verificada**; \( \gamma = 1 \) fijo y \( R_{eff} = R_{nom} - (H_0 - \bar{H}_{eq})\cdot 0.1 \) son heurísticas propias del código, no del paper. Los comentarios contienen restos de citas de IA (`[cite: 1]`, `[cite: 15]`) a limpiar.
- \( \alpha = 0.85 \) por defecto frente al 0.83 del paper original de Shinokura & Takai (1982): necesita calibración/justificación por tipo de pasada, no es un error en sí.
- Ángulo de mordedura calculado pero nunca contrastado con la fricción (\( \mu \geq \tan\alpha \)); sin aviso de agarre insuficiente.
- Sin corrección por tensión entre cajas (Mauk).
- Superficie libre: parábola fija \( y = y_{cont} - (y_{cont} - g/2)\,t^2 \), no la interpolación de radios de Shinokura (\( R_S = R_a W_t + R_f (1-W_t) \)).
- `cilindro_RSM`: el parámetro `n` (2 o 3) es el multiplicador del radio secundario (\( r_2 = n \cdot R \)), **no** el número de rodillos; no deducir "RSM de 2 o 3 rodillos" de ese dato.
- `cilindro_ovalo`: el parámetro `r_fijo` del JSON se ignora; el radio de suavizado `r_calculado` se deriva de las condiciones de tangencia.

---

## 6. Prioridad de corrección recomendada

1. H1 (luz en el ensanchamiento) y H2 (rotación conservativa) — afectan a todos los resultados.
2. H3 + H5 (chequeos de llenado y de cabida: filling % con aviso; rechazar entradas que no caben).
3. H4 (conservación de volumen: construir la salida con λ y Δb coherentes, no desde el contorno).
4. H8 (cargar JSON de luces y radios reales por caja/grupo).
5. H6, H7, H9, H10, H11, H12 (limpieza y consistencia).

Validación recomendada tras corregir: benchmark cruzado con PyRolL (el adaptador ya existe en `pyroll_bridge/`) y, en última instancia, secciones medidas de planta.
