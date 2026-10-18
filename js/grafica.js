/* grafica.js */

////_J_ 1. Registro global de instancias de gráficos (SÓLO UNA DECLARACIÓN AQUÍ)
const chartsInstances = {};

export function graficarCilindroGenerico(canvasId, cilindroGenerico, cilindroRelleno = null, alHacerClic = null) {
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl) return;

    // 2. Mapeo de datos para el Perfil Superior e Inferior
    const datosSup = cilindroGenerico.X_sup.map((xVal, i) => ({ x: xVal, y: cilindroGenerico.Y_sup[i] }));
    const datosInf = cilindroGenerico.X_inf.map((xVal, i) => ({ x: xVal, y: cilindroGenerico.Y_inf[i] }));

    // 3. Cálculo de límites máximos para mantener escala isométrica 1:1
    const maxAbsX = Math.max(...cilindroGenerico.X_sup.map(x => Math.abs(x)));
    const maxAbsY = Math.max(...cilindroGenerico.Y_sup.map(y => Math.abs(y)));

    const limiteX = Math.ceil(maxAbsX + 5);
    const limiteY = Math.ceil(maxAbsY + 5);

    const datasets = [
        {
            label: 'Perfil Superior',
            data: datosSup,
            borderColor: 'blue',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            pointRadius: 0
        },
        {
            label: 'Perfil Inferior',
            data: datosInf,
            borderColor: 'red',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            pointRadius: 0
        }
    ];

    ////_J_ 4. Polígono cerrado de relleno (+Y y -Y)
    if (cilindroRelleno && cilindroRelleno.X_sup && cilindroRelleno.X_sup.length > 0) {
        let poligonoRelleno = [];

        const X_sup = cilindroRelleno.X_sup;
        const Y_sup = cilindroRelleno.Y_sup;
        const X_inf = (cilindroRelleno.X_inf && cilindroRelleno.X_inf.length > 0) ? cilindroRelleno.X_inf : X_sup;
        const Y_inf = (cilindroRelleno.Y_inf && cilindroRelleno.Y_inf.length > 0) ? cilindroRelleno.Y_inf : Y_sup.map(y => -y);

        ////_J_ A) Tramo superior (de izquierda a derecha)
        for (let i = 0; i < X_sup.length; i++) {
            poligonoRelleno.push({ x: X_sup[i], y: Y_sup[i] });
        }

        ////_J_ B) Tramo inferior (de derecha a izquierda)
        for (let i = X_inf.length - 1; i >= 0; i--) {
            poligonoRelleno.push({ x: X_inf[i], y: Y_inf[i] });
        }

        ////_J_ C) Cierre del polígono
        if (poligonoRelleno.length > 0) {
            poligonoRelleno.push({ ...poligonoRelleno[0] });
        }

        datasets.push({
            label: 'Relleno',
            data: poligonoRelleno,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 200, 80, 0.45)',
            borderWidth: 1,
            pointRadius: 0,
            fill: 'shape',
            showLine: true
        });
    }

    ////_J_ 5. Destruir la instancia anterior si ya existe en este canvas
    if (chartsInstances[canvasId]) {
        chartsInstances[canvasId].destroy();
    }

    ////_J_ 6. Instanciar Chart.js con la acción al hacer clic
    const ctx = canvasEl.getContext("2d");
    chartsInstances[canvasId] = new Chart(ctx, {
        type: "line",
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: limiteX / limiteY,
            onHover: (event) => {
                if (event.native && event.native.target) {
                    event.native.target.style.cursor = 'pointer';
                }
            },
            onClick: (evt, activeElements, chart) => {
                if (typeof alHacerClic === "function") {
                    alHacerClic(evt, activeElements, chart);
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -limiteX,
                    max: limiteX
                },
                y: {
                    min: -limiteY,
                    max: limiteY
                }
            }
        }
    });
}