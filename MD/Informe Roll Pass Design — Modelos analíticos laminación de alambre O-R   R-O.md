# Modelos analíticos y matemáticos para la laminación en caliente de alambre: secuencias Óvalo-Redondo (O-R) y Redondo-Óvalo (R-O)

**Informe técnico — Roll Pass Design para laminación de alambre (wire rod) en caliente**

---

## 1. Alcance, notación y geometría de las pasadas

### 1.1 Las dos pasadas de la secuencia de acabado

En los trenes continuos de alambre (wire rod mills), la reducción final desde sección redonda hasta el alambre se realiza en la secuencia clásica **redondo → óvalo → redondo**, alternando cajas horizontales y verticales: el material sale de un calibre redondo, se gira 90° (físicamente mediante guías o por la disposición alternada de las cajas) y entra al calibre óvalo con la anchura del redondo como altura de entrada; a la salida del óvalo se gira de nuevo 90° y entra al redondo siguiente con su anchura como nueva altura ([Overhagen & Fu, KEM 926](https://www.scientific.net/KEM.926.589.pdf)).

- **Pasada Redondo→Óvalo (R-O):** el calibre óvalo comprime la altura de una sección aproximadamente circular; el material se ensancha lateralmente sobre la superficie libre del canal.
- **Pasada Óvalo→Redondo (O-R):** el óvalo entra rotado 90°; su anchura anterior se convierte en la altura comprimida y su altura anterior en la anchura de entrada ([Overhagen & Martin, MR Proceedings 44](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)).

La geometría del óvalo de un solo radio queda definida con la anchura del calibre \(b_K\), la altura \(h_K\), el radio de transición \(R_2\) y el gap \(s\). El radio principal se obtiene de la geometría ([Overhagen & Fu, Ec. 3](https://www.scientific.net/KEM.926.589.pdf)):

\[ R_1 = \frac{h_K^2 + b_K^2}{4\,h_K} \]

(La anchura del calibre en la cara del rodillo, *width on face* \(b_w\), también se necesita en el diseño; su expresión exacta figura en la referencia citada y no se reproduce aquí por no haber podido verificarse con fiabilidad en la extracción del documento.)

### 1.2 Notación común

| Símbolo | Significado |
|---|---|
| \(W_0, H_0, A_0\) | anchura máxima, altura máxima y área de la sección de entrada |
| \(W_1, H_1, A_1\) | anchura máxima, altura máxima y área de la sección de salida |
| \(s\) | gap entre rodillos (roll gap) |
| \(d_N\) | diámetro nominal de barril del rodillo |
| \(d_w\) | diámetro de trabajo (working roll diameter) |
| \(R\) | radio del rodillo |
| \(\Delta h = H_0 - H_1\) | reducción de altura |
| \(\lambda = A_0/A_1\) | alargamiento (elongación) |
| \(\beta = W_1/W_0\) | coeficiente de ensanchamiento |

### 1.3 Reglas de diseño de la secuencia (método clásico)

El diseño clásico divide la secuencia en pases de dos en dos: con \(n\) pasadas hay \(N = n/2\) secuencias. La elongación total \(\lambda_{tot} = A_0/A_n\) se reparte de forma degradativa ([Overhagen & Fu, Ecs. 5-8](https://www.scientific.net/KEM.926.589.pdf)):

\[ \lambda_i = \lambda_m \cdot Z^{y_i}, \qquad \lambda_m = \sqrt[N]{\lambda_{tot}}, \qquad y_i = \frac{N+1}{2} - i \]

donde \(Z > 1\) es un factor de degradación. Los calibres principales (redondos) se dimensionan primero a partir de las áreas \(A_i = A_{i-1}/\lambda_i\); el calibre menor (óvalo) de cada secuencia se determina después de forma **iterativa**: se propone un óvalo, se calcula el ensanchamiento de ambas pasadas, se evalúa el error de llenado respecto a los objetivos y se actualiza el óvalo; según los autores bastan unas pocas iteraciones ([Overhagen & Fu](https://www.scientific.net/KEM.926.589.pdf)).

---

## 2. Método del Rectángulo Equivalente de Lendl

### 2.1 Origen bibliográfico

El método del rectángulo (o pase) equivalente se debe a **A. E. Lendl**, publicado en dos partes:

- Lendl, A. E., *"Rolled Bars — Part I: Calculation of Spread between non parallel roll surfaces"*, **Iron and Steel**, vol. 21, nº 14, pp. 397–402 (1948).
- Lendl, A. E., *"Rolled Bars — Part II: Application of Spread Calculation to Pass Design"*, **Iron and Steel**, vol. 21, nº 14, pp. 601–604 (1948).

Estas citas completas aparecen en la bibliografía de [Overhagen (MR Proceedings, 9781644903131/99)](https://mrforum.com/wp-content/uploads/open_access/9781644903131/99.pdf) y de [La Metallurgia Italiana, mayo 2023](https://www.aimnet.it/la_metallurgia_italiana/2023/maggio/Stirl.pdf). En su formulación original, Lendl subdividía la sección de paso (cuadrada, rombo, redonda u oval) en **franjas verticales** y calculaba el ensanchamiento de cada franja con la fórmula empírica de Ekelund, absorbiendo así el efecto de superficies de rodillo no paralelas ([tesis doctoral, Durham University](https://etheses.durham.ac.uk/id/eprint/3959/1/3959_1475.pdf)).

### 2.2 Construcción del rectángulo equivalente

La idea central: **cualquier pasada de calibre se transforma en una pasada plana equivalente**, a la que se pueden aplicar las fórmulas de ensanchamiento de la laminación plana. La construcción moderna (la que usan los códigos actuales) es:

1. Se solapan el contorno de la sección de entrada y el contorno del calibre. La intersección de ambos contornos define la anchura característica \(b_L\) (distancia entre los puntos de intersección).
2. Se definen las **áreas equivalentes** \(A_{0L}\) y \(A_{1L}\): solo la parte de cada sección que queda **directamente comprimida entre los rodillos** (dentro de \(b_L\)). El resto del material no se comprime verticalmente, sino que es desplazado lateralmente por el ensanchamiento. Por ello ([Overhagen & Fu, Ecs. 9-10](https://www.scientific.net/KEM.926.589.pdf)):

\[ A_{0L} < A_0, \qquad A_{1L} < A_1 \]

3. Las **alturas equivalentes** de entrada y salida de la pasada plana equivalente son ([Overhagen & Fu, Ecs. 11-12](https://www.scientific.net/KEM.926.589.pdf); idénticas en [IJAMT 2023, Ecs. 65-66](https://link.springer.com/10.1007/s00170-023-11584-x)):

\[ h_{0L} = \frac{A_{0L}}{b_L}, \qquad h_{1L} = \frac{A_{1L}}{b_L} \]

4. El **diámetro de trabajo** de la pasada equivalente ([Overhagen & Fu, Ec. 13](https://www.scientific.net/KEM.926.589.pdf); [IJAMT 2023, Ec. 67](https://link.springer.com/10.1007/s00170-023-11584-x)):

\[ d_w = d_N + s - h_{1L} \]

Con esto, la pasada de calibre queda reducida a una pasada plana y **cualquier modelo de ensanchamiento de laminación plana** (Wusatowski, Marini, Roux, Ekelund…) puede aplicarse. Importante: \(b_L\) sirve para construir las alturas equivalentes, pero **no sustituye a la anchura de entrada**: en la aplicación al pase óvalo, el cálculo del ensanchamiento usa \(h_{0L}\), \(h_{1L}\), \(d_w\) junto con la anchura completa de la sección de entrada (por ejemplo, \(w_0 = d_0\) en la pasada redondo→óvalo) ([IJAMT 2023, §2.5](https://link.springer.com/10.1007/s00170-023-11584-x); implementación de [PyRolL](https://github.com/pyroll-project/pyroll-lendl-equivalent-method), donde `equivalent_width` es la anchura completa del perfil).

### 2.3 Aplicación a las pasadas R-O y O-R

En la implementación de [Overhagen & Martin](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf) (que extiende el método de Lendl):

- **R-O:** se calcula la anchura de salida del óvalo \(w_1 = w_{os}\) a partir de la geometría equivalente (áreas de intersección entre el círculo de entrada de diámetro \(d_0\) y el contorno del óvalo de altura \(h_{ov}\) y radio \(r_{ov}\)); con \(w_{os}\) se construye el contorno del óvalo.
- **O-R:** el óvalo se **rota 90°**: su anchura anterior \(w_{os}\) pasa a ser la altura de entrada y su altura \(h_{ov}\) la anchura de entrada. El cálculo de ensanchamiento sobre la pasada equivalente entrega la anchura de salida \(w_2\) de la sección redonda.

### 2.4 Implementación abierta verificable (PyRolL)

El plugin `pyroll-lendl-equivalent-method` del framework abierto [PyRolL](https://github.com/pyroll-project) implementa literalmente el método: el ancho de Lendl (*lendl_width*) es la anchura entre los puntos de intersección del perfil entrante y el contorno del calibre; la sección de Lendl (*lendl_section*) es el polígono comprendido entre el calibre y el perfil dentro de ese ancho; y la altura equivalente es ([código fuente](https://github.com/pyroll-project/pyroll-lendl-equivalent-method)):

```python
equivalent_height = lendl_section.area / lendl_width
```

Es exactamente \(h_L = A_L / b_L\), computado con operaciones geométricas (shapely) sobre los contornos poligonales.

---

## 3. Método de Shinokura & Takai (1982)

### 3.1 Referencia original

- Shinokura, T. y Takai, K., *"A new method for calculating spread in rod rolling"*, **Journal of Applied Metalworking**, vol. 2, nº 2, pp. 94–99 (1982). DOI: [10.1007/BF02834206](https://doi.org/10.1007/BF02834206).

Los autores laminaron en caliente redondos de acero dulce en cuatro tipos de pasadas (cuadrado-óvalo, **redondo-óvalo**, cuadrado-rombo y rombo-rombo) y obtuvieron una fórmula de ensanchamiento con un **único coeficiente** \(\alpha\), con la que pueden calcularse con precisión la anchura máxima proyectada \(W_1\) y el área de la sección de salida \(F_1\) ([Springer, página del artículo](https://link.springer.com/article/10.1007/BF02834206)). Nótese que las cuatro pasadas del estudio original no incluyen la pasada óvalo→redondo.

### 3.2 El rectángulo equivalente en Shinokura–Takai

El método también se apoya en una sección equivalente de la pasada: la sección entrante y el calibre se describen mediante anchuras y **alturas medias** construidas a partir de sub-áreas de la geometría de la pasada. Según la transcripción de [Capece Minutolo et al. (JAMME 2003)](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf), verificada visualmente sobre la página impresa, las alturas medias se definen como:

\[ H_{iS} = \frac{A_0 - A_s}{B_c}, \qquad H_{0S} = \frac{A_0 - A_s - A_f}{B_c} \]

donde \(A_0\) es el área de la sección de entrada, \(A_s\) son las **áreas laterales de la sección entrante que quedan fuera de la zona de contacto** (no comprimidas directamente), \(A_f\) es un sub-área adicional del calibre, y \(B_c\) es la **anchura de la zona central de contacto** (todas ilustradas en la Fig. 1 de ese trabajo). Son cuatro magnitudes geométricas distintas de la pasada; no debe identificarse \(A_h\) con la simple diferencia \(A_0 - A_1\). Estas alturas medias juegan el mismo papel que las del rectángulo equivalente: convierten la pasada de calibre en una pasada plana representativa.

### 3.3 Fórmula de ensanchamiento

Tal como la citan [Capece Minutolo, Durante, Lambiase y Langella (JAMME 2003, Ec. 1)](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf):

\[ W_{max} = W_i \left[ 1 + \gamma \cdot \frac{\sqrt{R\,(H_{iS} - H_{0S})}}{W_i + 0.5\,H_i} \cdot \frac{A_h}{A_0} \right] \]

con:

- \(W_{max}\): anchura máxima del material a la salida (ensanchamiento máximo);
- \(W_i\), \(H_i\), \(A_0\): anchura máxima, altura máxima y área de la sección de entrada;
- \(H_{iS}\), \(H_{0S}\): alturas medias de la sección entrante y del calibre (definidas arriba);
- \(R\): radio del rodillo; el término \(\sqrt{R(H_{iS}-H_{0S})}\) es la **longitud proyectada de contacto** \(L_{dm}\) calculada con las alturas medias;
- \(A_h\): área de intersección entre el contorno del calibre y la sección entrante — la zona barrida por la compresión vertical, sombreada en la Fig. 1 de Capece Minutolo et al.; \(A_h/A_0\) se describe en la literatura como la fracción de reducción de área ([IJPEM-ST, descripción de los símbolos](https://academic.oup.com/ijpem-st/article/1/1/19/8735291));
- \(\gamma\) (o \(\alpha\)): coeficiente empírico.

La versión de la fórmula en el resumen original ([Springer](https://link.springer.com/article/10.1007/BF02834206)) es:

\[ \frac{\Delta B}{B_0} = \alpha \cdot \frac{L_{dm}}{B_0 + 0.5\,H_0} \cdot \frac{F_H}{F_0} \]

Ambas notaciones describen la misma estructura: ensanchamiento relativo = coeficiente × (longitud de contacto proyectada / anchura característica) × (reducción de área relativa).

**Valores del coeficiente:**

- El trabajo original recomienda \(\alpha = 0.83\) como valor común para las cuatro pasadas investigadas ([Springer](https://link.springer.com/article/10.1007/BF02834206)).
- [Capece Minutolo et al.](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf) indican que \(\gamma\) varía entre **0.8 y 1.1** según el tipo de pasada, y usan 0.83 en sus pasadas redondo-óvalo plano.
- Una aplicación posterior a alambre de acero reporta \(\alpha = 0.97\) para la pasada **redondo→óvalo** y \(\alpha = 0.83\) para la pasada **óvalo→redondo**; son valores reportados por esa aplicación, no recomendaciones universales del trabajo original ([IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291)).

### 3.4 Cálculo del perfil de superficie libre y de la sección de salida

Tras obtener \(W_{max}\), el modelo calcula el **perfil de la superficie libre** del material a la salida: el radio \(R_S\) del perfil en la garganta del calibre se obtiene por interpolación lineal entre el radio de curvatura de la sección entrante \(R_a\) y el radio del calibre \(R_f\) ([Capece Minutolo et al., Ec. 2](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf)):

\[ R_S = R_a \cdot W_t + R_f (1 - W_t), \qquad W_t = \frac{W_f - W_{max}}{W_f - W_i} \]

donde \(W_f\) es la anchura del calibre. El área de la sección de salida se obtiene integrando el contorno así construido; la conservación de volumen sirve después como comprobación de coherencia y para relacionar áreas y velocidades entre cajas.

En la práctica de cálculo, el diseño del calibre menor (óvalo) de cada secuencia se resuelve de forma iterativa: se propone la geometría, se calcula el ensanchamiento y el llenado de ambas pasadas, y se actualiza el calibre hasta cumplir los objetivos de llenado; según Overhagen & Fu bastan unas pocas iteraciones por secuencia ([Overhagen & Fu](https://www.scientific.net/KEM.926.589.pdf)).

### 3.5 Limitaciones del modelo

Según el análisis de [IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291):

- El modelo considera principalmente **parámetros geométricos**: la velocidad de laminación, la fricción y las tensiones entre cajas no aparecen explícitamente en la fórmula.
- No existe un criterio estándar para elegir \(\alpha\); hay que recalibrarlo cuando cambian las condiciones del proceso.
- Ante cambios de tensión entre cajas (interstand tension) el error de predicción crece.

---

## 4. Cálculo del ensanchamiento (spread) en las pasadas R-O y O-R

### 4.1 Definiciones

Siguiendo la tesis de Durham ([Rolling mill roll design](https://etheses.durham.ac.uk/id/eprint/3959/1/3959_1475.pdf)):

- Ensanchamiento absoluto: \(\Delta W = W_1 - W_0\)
- Ensanchamiento relativo: \(\varepsilon_w = (W_1 - W_0)/W_0\)
- Coeficiente de ensanchamiento: \(\beta = W_1/W_0\)
- Parámetro de ensanchamiento: \(S_w = \dfrac{\ln(W_1/W_0)}{\ln(h_0/h_1)}\)

### 4.2 Modelo de Wusatowski

El modelo más usado para la pasada plana equivalente. Forma general (formulación tal como está implementada y verificada en el plugin abierto [pyroll-wusatowski-spreading](https://github.com/pyroll-project/pyroll-wusatowski-spreading), tomada del clásico de Wusatowski, *Fundamentals of Rolling*, 1969):

\[ \frac{W_1}{W_0} = a \cdot c \cdot d \cdot f \cdot \left(\frac{h_1}{h_0}\right)^{-w} \]

con \(a, c, d, f\) factores de corrección por **temperatura, velocidad, material y fricción** (según el código de PyRolL; los valores por defecto son 1 salvo el de velocidad), y el exponente:

\[ w = 10^{\left(-1.269 \left(\frac{h_0}{D}\right)^{0.556} \frac{w_0}{h_0}\right)} \qquad \text{(régimen } h_1/h_0 \geq 0.5\text{)} \]

\[ w = 10^{\left(-3.457 \left(\frac{h_0}{D}\right)^{0.968} \frac{w_0}{h_0}\right)} \qquad \text{(régimen } h_1/h_0 < 0.5\text{, alta deformación)} \]

donde \(D\) es el diámetro de trabajo del rodillo. En la implementación de PyRolL (transcripción fiel del [código](https://github.com/pyroll-project/pyroll-wusatowski-spreading)):\
\(q = \texttt{draught}\) es el cociente de alturas del rectángulo equivalente del perfil (definido en el [núcleo de PyRolL](https://github.com/pyroll-project/pyroll-core/blob/main/pyroll/core/roll_pass/hookimpls/deformation_unit.py) como `out.equivalent_rectangle.height / in.equivalent_rectangle.height`), y \(h_{0e}\), \(b_{0e}\) son la altura y anchura equivalentes del perfil de entrada (`equivalent_height`, `equivalent_width`):

\[ \frac{W_1}{W_0} = a\,c\,d\,f\; q^{-w}, \qquad w = 10^{-1.269\,(h_{0e}/D)^{0.556}\,(b_{0e}/h_{0e})} \]

Nota sobre la correspondencia de variables: por defecto, el núcleo de PyRolL define el rectángulo equivalente con la misma área y la misma relación anchura/altura que el perfil (`equivalent_height = sqrt(A·h/w)`, `equivalent_width = sqrt(A·w/h)`, según su [código fuente](https://github.com/pyroll-project/pyroll-core/blob/main/pyroll/core/profile/hookimpls.py)); cuando el plugin de Lendl está activo (configuración `pyroll-basic`), esas propiedades se redefinen con las alturas de Lendl, de modo que el modelo de Wusatowski opera entonces sobre la geometría de Lendl. No deben confundirse ambas definiciones cuando se combina con otros plugins.

**Interpretación física:** el exponente \(w\) decrece cuando crece \(w_0/h_0\) (secciones anchas se ensanchan menos) y cuando crece \(h_0/D\) (rodillos grandes generan más ensanchamiento). Por eso, en las secuencias de alambre, al aumentar el diámetro de rodillo los óvalos salen más planos y anchos, como documenta [Overhagen & Fu](https://www.scientific.net/KEM.926.589.pdf) en su estudio paramétrico (300-800 mm de diámetro).

### 4.3 Modelo de Marini

Es el modelo usado por la escuela de Duisburg (Mauk, Kopp) junto con el rectángulo equivalente de Lendl. Según [IJAMT 2023, Ecs. 56-59](https://link.springer.com/10.1007/s00170-023-11584-x), la anchura de salida es:

\[ w_1 = w_0 + \frac{2\,\Delta h\, w_0 \left(R - \frac{h_0}{2}\right) B}{h_1 w_0 + M_1 + 2\,h_1 R B} \]

con los parámetros auxiliares:

\[ A = \frac{\sqrt{\Delta h}}{2\,\mu\,\sqrt{R}}, \qquad B = \sqrt{\frac{\Delta h}{R}} \]

\[ M_1 = \frac{w_0 (h_0 + h_1)}{2} \cdot \frac{1+A}{1-A} \cdot \frac{0.91\,(w_0 + 3 h_0)}{4 h_0} \]

La ecuación incorpora explícitamente la geometría de la pasada y el coeficiente de fricción \(\mu\). Esta es exactamente la formulación implementada en el plugin abierto [pyroll-marini-spreading](https://github.com/pyroll-project/pyroll-marini-spreading) del framework PyRolL (verificada en su [código fuente](https://github.com/pyroll-project/pyroll-marini-spreading/blob/main/pyroll/marini_spreading.py)), lo que permite reproducirla sin ambigüedad.

### 4.4 Modelo de Roux

Overhagen emplea el modelo de ensanchamiento de **Roux** para pasadas planas aplicado al rectángulo equivalente de Lendl, por considerarlo fiable en el diseño de alambre ([Overhagen & Fu, KEM 926](https://www.scientific.net/KEM.926.589.pdf)). El modelo calcula la anchura de salida \(w_1\) en función de la geometría de la pasada plana equivalente; el parámetro geométrico que gobierna la no-linealidad es:

\[ B = \left(\frac{b_0}{h_0} - 1\right)\left(\frac{b_0}{h_0}\right)^{2/3} \]

(Ec. 16 de [Overhagen & Fu](https://www.scientific.net/KEM.926.589.pdf); la ecuación de anchura de salida completa aparece en la referencia original de Roux allí citada). En la práctica de diseño, Roux + Lendl es la combinación usada en el software **MPC – Mill Process Calculations** y en los algoritmos abiertos de Overhagen ([Overhagen & Martin](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)).

### 4.5 Otros modelos clásicos citables

- **Saito, Takahashi y Kato (1983):** *"Calculation of spread, elongation, effective roll radius, roll force and torque when rolling in the square-diamond, square-oval and round-oval passes"*, Journal of the Iron and Steel Institute of Japan — fórmulas empíricas específicas por tipo de pasada, citadas en la literatura de modelado de sección ([revisión citada por la Univ. de Basora](https://faculty.uobasrah.edu.iq/uploads/publications/1694931726.pdf)).
- **Shinokura & Takai (1986):** *"Mathematical models of roll force and torque in steel bar rolling"*, complemento del modelo de ensanchamiento con fuerzas y par ([cita en la misma revisión](https://faculty.uobasrah.edu.iq/uploads/publications/1694931726.pdf)).
- **Trinks, Ekelund, El-Kalay & Sparling:** fórmulas empíricas históricas de ensanchamiento en laminación plana; Ekelund es la base de las franjas verticales del método original de Lendl ([tesis Durham](https://etheses.durham.ac.uk/id/eprint/3959/1/3959_1475.pdf)).
- **Youngseog Lee (POSTECH):** modelos analíticos para secuencias redondo-óvalo-redondo: eficiencia de llenado del óvalo \(i = (W_o/W_g)\times 100\) (anchura del material / anchura del calibre), modelos de perfil de superficie y de deformación efectiva media ([Springer, JEAS 2024](https://link.springer.com/article/10.1186/s44147-024-00567-8)).

### 4.6 Efecto de las tensiones entre cajas (interstand tension)

En trenes continuos, la tensión modifica el ensanchamiento. El modelo empírico de Mauk incorpora la contribución de tensión a la deformación de área ([IJAMT 2023, Ecs. 61-64](https://link.springer.com/10.1007/s00170-023-11584-x)):

\[ \varphi_A = \ln\left(\frac{A_1}{A_0}\right) = \varphi_{A,0} + \Delta\varphi_{A,\sigma} \]

\[ \Delta\varphi_{A,\sigma} = k_1\left(\frac{t_0}{k_{fm}}\right)^2 + k_2\left(\frac{t_0}{k_{fm}}\right) + k_3\left(\frac{t_1}{k_{fm}}\right) \]

\[ k_i = m_{i1}\frac{\Delta h}{h_0} + m_{i2}\frac{w_0}{h_0} + m_{i3}\frac{A_d}{A_m} \]

con \(t_0, t_1\) tensiones de entrada/salida y \(k_{fm}\) tensión media de fluencia; los coeficientes \(k_i\) son funciones de la geometría de la pasada cuyos parámetros se obtienen por regresión de ensayos (los coeficientes de la fuente se calibraron con ensayos de laminación con tensión; sus valores numéricos deben consultarse en la referencia). Este tipo de corrección es relevante en el diseño de trenes continuos de alambre, y es una de las carencias del modelo puro de Shinokura ([IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291)).

### 4.7 Criterios de llenado del calibre (groove filling)

El objetivo del cálculo iterativo es acercar el llenado a los valores objetivo sin sobrellenado ([Overhagen & Fu](https://www.scientific.net/KEM.926.589.pdf); [Overhagen & Martin](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)):

| Tipo de calibre | Factor de llenado objetivo \(f\) | Definición del factor |
|---|---|---|
| Óvalos de un radio | \(\approx 0.80 - 0.85\) | \(f = b_{act}/b_w\) (anchura de sección / anchura del calibre en la cara) |
| Óvalos de doble radio | \(\approx 0.85 - 0.90\) | \(f = b_{act}/b_w\) |
| Redondos | \(\approx 0.95 - 1.0\) | \(f = b_{act}/h_K\) (anchura de sección / altura del calibre) |

Estos factores usan denominadores distintos (anchura en cara vs. altura del calibre), por lo que sus porcentajes no son directamente comparables entre tipos de calibre. El sobrellenado (overfill) del óvalo puede causar defectos graves en la pasada redonda siguiente, según el modelo ISIJ de perfil de superficie libre ([ISIJ Int. 2023](https://www.jstage.jst.go.jp/article/isijinternational/63/1/63_ISIJINT-2022-248/_html/-char/en)). Un estudio de optimización R-O-R reciente impone límites de llenado del 95% (óvalo) y 98% (redondo) como restricciones de diseño ([Springer JEAS 2024](https://link.springer.com/article/10.1186/s44147-024-00567-8)).

---

## 5. Software comercial y algoritmos abiertos para simular el llenado del canal

### 5.1 DEFORM-3D (SFTC)

[DEFORM-3D](https://www.deform.com/products/deform-3d/) es un sistema de simulación de procesos de conformado por elementos finitos diseñado para analizar el **flujo tridimensional de metal** en procesos complejos, con el laminado entre sus aplicaciones típicas (forja en matriz, extrusión, trefilado, laminado, etc.). En alambre y barra se ha usado para optimización de diseños de calibre en trenes de alta velocidad: por ejemplo, el estudio *Optimization Design Based on DEFORM-3D Finite Element Analysis about Steel Rolling Production* aplicó DEFORM-3D a un tren de alambrón de alta velocidad para optimizar la secuencia de calibres ([Scientific.Net KEM 480-481](https://www.scientific.net/KEM.480-481.1079)). El flujo de trabajo típico es: diseño analítico inicial (Lendl/Shinokura) → verificación y refinamiento del llenado en 3D → validación con medidas de sección.

### 5.2 QForm UK + QKaliber

QForm UK dispone de módulos específicos para **laminación longitudinal** (y laminación reversible). Sus características clave para el llenado del canal ([QForm Technology Manual](https://docs.qform3d.com/qform/en/technology_longitudinal_rolling.htm)):

- El material se empuja automáticamente al entrehierro y se mantiene horizontal sin condiciones de contorno especiales;
- **Método de doble malla**: una malla "mecánica", densificada en la zona de contacto/deformación, para resolver la deformación, y una malla "geométrica" con funciones distintas (almacenar la forma del producto y resolver el campo térmico), con intercambio de datos entre ambas — hace viable simular secuencias largas con precisión de contorno;
- Rodillos cuasi-rotacionales con malla fija espacial y velocidades nodales transferidas al material; parada automática al salir del calibre;
- Simulación de uno o varios grupos de cajas con configuraciones distintas, guías de entrada/salida y empujador.

El CAD **QKaliber** realiza el diseño automatizado de calibres (round, diamond, square, oval en forma paramétrica), calcula ensanchamiento y alargamiento de secciones a lo largo de las pasadas, respeta límites de carga/par del laminador, y transfiere el diseño directamente a QForm UK vía API ([Biba et al., Metal Forming 2024](https://mrforum.com/wp-content/uploads/open_access/9781644903254/81.pdf)). En su validación industrial sobre un laminador continuo (viga IPE 160, 16 cajas) se obtuvo una correspondencia del **94.43%** entre potencia simulada y medida en ese caso ([Biba et al.](https://mrforum.com/wp-content/uploads/open_access/9781644903254/81.pdf)). Esta combinación (diseño analítico automatizado + FEM 3D acoplado térmomecánicamente) es representativa del enfoque comercial actual para producto largo.

### 5.3 Otros FEM comerciales usados en la literatura

- **ABAQUS/Explicit**: usado con modelos 3D dinámicos no lineales para pasadas R-O-R y para generar metamodelos de llenado ([Springer JEAS 2024](https://link.springer.com/article/10.1186/s44147-024-00567-8); [IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291)).
- **MSC.Marc / Marc Autoforge**: simulación de pasadas redondo-óvalo y óvalo-redondo en estudios académicos ([Capece Minutolo et al.](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf); [tesis KTH, DiVA portal](https://www.diva-portal.org/smash/get/diva2:10197/fulltext01.pdf)).

### 5.4 PyRolL (código abierto, recomendado)

[PyRolL](https://pyroll.org/) es el framework abierto de referencia (licencia BSD-3, Python). Su paper de publicación es: *"An Extensible OpenSource Framework for Rolling Simulation"*, [JOSS, doi:10.21105/joss.06200](https://joss.theoj.org/papers/10.21105/joss.06200.pdf). Características:

- Simula secuencias completas de cajas estimando llenado, fuerzas, pares, térmica y microestructura con **modelos analíticos reducidos** (no es un FEM 3D: la evolución detallada de la superficie libre del material se aproxima con los modelos de ensanchamiento, no se resuelve por elementos finitos);
- Sistema de plugins: cada modelo (ensanchamiento, contacto, tensión de fluencia) es intercambiable, lo que permite comparar predicciones de distintos modelos sobre la misma secuencia;
- Modelos verificados en su código: **Wusatowski** ([pyroll-wusatowski-spreading](https://github.com/pyroll-project/pyroll-wusatowski-spreading)), **Marini** ([pyroll-marini-spreading](https://github.com/pyroll-project/pyroll-marini-spreading)), **Lendl** ([pyroll-lendl-equivalent-method](https://github.com/pyroll-project/pyroll-lendl-equivalent-method)), contacto de Zouhar, tensión de fluencia de Freiberg, análisis de agarre, termoelasticidad del laminador, etc.;
- Incluye una interfaz gráfica de diseño de secuencia ([PyRolL GUI](https://sag-kalibreur.github.io/pyroll-gui-docs/PassDesign_Guide.html)).

Es, en la práctica, el algoritmo abierto de referencia para el diseño y la estimación del llenado en secuencias óvalo-redondo con modelos analíticos.

### 5.5 Otros algoritmos abiertos y modelos modernos

- **threeroll** (C. Overhagen, Univ. Duisburg-Essen, MATLAB, [GitHub](https://github.com/choverhagen/threeroll)): algoritmo numérico de diseño de calibres para laminadores de tres rodillos (presentado en AISTech 2024). Optimiza el calibre (radio principal, radios de transición, gap) para lograr una reducción de área y un **factor de llenado** dados, con el modelo de ensanchamiento incluido.
- **Modelo analítico sin parámetros de ajuste** para el ensanchamiento lateral (Erfanian, Slater, Brambley, *European Journal of Mechanics A/Solids*, [arXiv:2504.06300](https://arxiv.org/pdf/2504.06300)): investigación relacionada — laminación **plana** de alambre redondo entre rodillos cilíndricos (sin calibres); derivado de las ecuaciones gobernantes (material rígido-perfectamente plástico), predice el ensanchamiento en segundos de cómputo sin calibración; el código MATLAB se distribuye como material suplementario. Validado con alambre de acero inoxidable (rodillos de 100 mm, reducciones 20-60%).
- **MPC – Mill Process Calculations** (comercial, usado en los benchmarks de la literatura): software de cálculo de secuencia con Lendl + Roux ([Overhagen & Martin](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)).
- **Modelos con IA/ML:** redes neuronales entrenadas sobre datos FEM o sobre el cálculo analítico iterativo: ANN con función de pérdida basada en las ecuaciones de conformado ([Overhagen & Martin](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)); fusión MLP+ANFIS con error absoluto de hasta 1.3% frente a medidas de fábrica en el caso de seis cajas estudiado ([IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291)); metamodelos polinómicos de resultados FEM con R² ≥ 0.99 ([Springer JEAS 2024](https://link.springer.com/article/10.1186/s44147-024-00567-8)).
- **Modelo de perfil de superficie libre (FSP)** para secuencias O-R/R-O: modelo analítico que asume perfil circular de superficie libre y calcula el punto de separación y el área de salida; en el ejemplo de diez pasadas estudiado, el error del punto de separación frente a FEM fue de 0.3-1% y la diferencia de área final del 0.015% ([ISIJ International 2023](https://www.jstage.jst.go.jp/article/isijinternational/63/1/63_ISIJINT-2022-248/_html/-char/en)).

---

## 6. Comparación, limitaciones y recomendaciones

| Enfoque | Velocidad de cálculo | Tipo de predicción del llenado | Necesita calibración | Uso típico documentado |
|---|---|---|---|---|
| Lendl + Ekelund (franjas) | Muy alta | Empírica, por franjas | Sí (coeficientes de Ekelund) | Diseño preliminar clásico ([tesis Durham](https://etheses.durham.ac.uk/id/eprint/3959/1/3959_1475.pdf)) |
| Shinokura–Takai | Muy alta | Empírico-geométrica (anchura y perfil máximos) | Sí (\(\alpha\) por tipo de pasada) | Diseño rápido y control de proceso ([JAMME 2003](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf)) |
| Lendl + Wusatowski / Marini / Roux | Muy alta | Empírica sobre pasada plana equivalente | Coeficientes publicados | Diseño iterativo de secuencia completa ([KEM 926](https://www.scientific.net/KEM.926.589.pdf), [IJAMT 2023](https://link.springer.com/10.1007/s00170-023-11584-x)) |
| FEM 3D (DEFORM, QForm, ABAQUS) | Baja | Resuelve deformación, contacto y superficie libre | Datos de material y fricción | Validación final, defectos, nuevos materiales ([KEM 480-481](https://www.scientific.net/KEM.480-481.1079), [Biba et al.](https://mrforum.com/wp-content/uploads/open_access/9781644903254/81.pdf)) |
| PyRolL (analítico abierto) | Alta | Modelos reducidos (no FEM) | Modelos publicados | Diseño + estudio paramétrico reproducible ([pyroll.org](https://pyroll.org/)) |
| Metamodelos ANN / fusión ML | Instantánea (tras entrenar) | Interpolación en el dominio entrenado | Grandes bases de datos | Control en línea, optimización ([IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291)) |

**Recomendaciones prácticas:**

1. Para el diseño de una secuencia R-O/O-R de alambre, el flujo de trabajo documentado es: dimensionado de calibres principales por elongaciones degradativas ([KEM 926](https://www.scientific.net/KEM.926.589.pdf)) → calibres menores (óvalos) por iteración con Lendl + un modelo de ensanchamiento (Wusatowski/Marini/Roux o Shinokura) ([KEM 926](https://www.scientific.net/KEM.926.589.pdf), [IJAMT 2023](https://link.springer.com/10.1007/s00170-023-11584-x)) → verificación FEM 3D (QForm/QKaliber, DEFORM-3D) del llenado y defectos ([Biba et al.](https://mrforum.com/wp-content/uploads/open_access/9781644903254/81.pdf), [KEM 480-481](https://www.scientific.net/KEM.480-481.1079)) → ajuste del coeficiente de Shinokura o de los factores de corrección con datos de planta.
2. Para reproducibilidad y coste cero, **PyRolL** implementa los bloques analíticos citados (Lendl, Wusatowski, Marini) con licencia abierta y código auditable ([pyroll.org](https://pyroll.org/)).
3. El coeficiente \(\alpha\) de Shinokura–Takai debe calibrarse por tipo de pasada y condiciones (0.83 es el valor del estudio original; 0.97/0.83 R-O/O-R son valores reportados por una aplicación posterior ([IJPEM-ST](https://academic.oup.com/ijpem-st/article/1/1/19/8735291))); el modelo no incorpora tensión, velocidad ni fricción, por lo que en trenes continuos conviene añadir la corrección de tensión de Mauk ([IJAMT 2023](https://link.springer.com/10.1007/s00170-023-11584-x)).
4. Los objetivos de llenado (≈85% en óvalos, ≈95-98% en redondos) actúan como restricciones del diseño ([KEM 926](https://www.scientific.net/KEM.926.589.pdf), [Overhagen & Martin](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)); el sobrellenado del óvalo puede causar defectos en la pasada redonda siguiente ([ISIJ Int. 2023](https://www.jstage.jst.go.jp/article/isijinternational/63/1/63_ISIJINT-2022-248/_html/-char/en)).

---

## Referencias principales

1. Shinokura, T., Takai, K., *A new method for calculating spread in rod rolling*, J. Applied Metalworking 2(2) (1982) 94-99. [https://doi.org/10.1007/BF02834206](https://doi.org/10.1007/BF02834206)
2. Lendl, A.E., *Rolled Bars — Part I & II*, Iron and Steel 21(14) (1948) 397-402, 601-604. Citas completas en [MR Proceedings (Overhagen)](https://mrforum.com/wp-content/uploads/open_access/9781644903131/99.pdf)
3. Capece Minutolo, F., Durante, M., Lambiase, F., Langella, A., *Dimensional analysis of a new type of groove for steel rebar rolling*, documento AMME 2003 (papers_amme03/1230), p. 144, Ecs. (1)-(2). [PDF](http://jamme.acmsse.h2.pl/papers_amme03/1230.pdf)
4. Overhagen, C., Fu, K., *Data-Driven Roll Pass Design of Wire Rod Mills*, Key Engineering Materials 926 (2022). [PDF](https://www.scientific.net/KEM.926.589.pdf)
5. Overhagen, C., Martin, R., *Roll pass design for round and square sections using an informed artificial neural network*, MR Proceedings (Metal Forming 2024). [PDF](https://mrforum.com/wp-content/uploads/open_access/9781644903254/48.pdf)
6. *Numerical assessment of interstand tensions in continuous hot rolling processes of flat and long products*, Int. J. Adv. Manuf. Technol. (2023). [https://doi.org/10.1007/s00170-023-11584-x](https://link.springer.com/10.1007/s00170-023-11584-x)
7. *Prediction of Spread in Steel Wire Rod Rolling: Transferable and Explainable Approach*, Int. J. Precision Eng. Manuf.-Smart Technol. 1(1). [https://academic.oup.com/ijpem-st/article/1/1/19/8735291](https://academic.oup.com/ijpem-st/article/1/1/19/8735291)
8. *Optimal design of round-oval-round roll pass for the steel bar rolling process*, J. Eng. Appl. Sci. (2024). [https://doi.org/10.1186/s44147-024-00567-8](https://link.springer.com/article/10.1186/s44147-024-00567-8)
9. *Analytical Model to Predict the Free Surface Profile of outgoing material in oval-to-round pass rolling*, ISIJ International 63(1) (2023). [https://www.jstage.jst.go.jp/article/isijinternational/63/1/63_ISIJINT-2022-248/_html/-char/en](https://www.jstage.jst.go.jp/article/isijinternational/63/1/63_ISIJINT-2022-248/_html/-char/en)
10. *Rolling mill roll design* (tesis doctoral), Durham University. [PDF](https://etheses.durham.ac.uk/id/eprint/3959/1/3959_1475.pdf)
11. *Numerical Simulation of Shape Rolling* (tesis, KTH), DiVA portal. [PDF](https://www.diva-portal.org/smash/get/diva2:10197/fulltext01.pdf)
12. PyRolL Project: [https://pyroll.org/](https://pyroll.org/) | [JOSS paper](https://joss.theoj.org/papers/10.21105/joss.06200.pdf) | [pyroll-lendl-equivalent-method](https://github.com/pyroll-project/pyroll-lendl-equivalent-method) | [pyroll-wusatowski-spreading](https://github.com/pyroll-project/pyroll-wusatowski-spreading) | [pyroll-marini-spreading](https://github.com/pyroll-project/pyroll-marini-spreading)
13. Biba, N., Stebunov, S., Maltsev, P., Belugin, V., Alimov, I., *Integration of automated roll pass design and simulation for the development of shape rolling technology*, Metal Forming 2024, MR Proceedings 44. [PDF](https://mrforum.com/wp-content/uploads/open_access/9781644903254/81.pdf)
14. QForm UK, Technology Manual — Longitudinal rolling: [https://docs.qform3d.com/qform/en/technology_longitudinal_rolling.htm](https://docs.qform3d.com/qform/en/technology_longitudinal_rolling.htm)
15. DEFORM-3D (SFTC): [https://www.deform.com/products/deform-3d/](https://www.deform.com/products/deform-3d/)
16. Erfanian, M., Slater, C.D., Brambley, E.J., *Modelling Lateral Spread in Wire Flat Rolling*, Eur. J. Mech. A/Solids 117, 106027. [arXiv:2504.06300](https://arxiv.org/pdf/2504.06300)
17. Overhagen, C., *threeroll* — código abierto de diseño de calibres: [https://github.com/choverhagen/threeroll](https://github.com/choverhagen/threeroll)
