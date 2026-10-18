/* pasadas.js */

const n_puntos = 40;

// 1. Base de datos para luces y factores de transformación por palanquilla
export function luces_R_palanquilla() {
    const luces_BDM = [
<<<<<<< HEAD:Laminación/js/pasadas.js
        { palanquilla: 130, pasadas: [ { id: "AH", Valor_luz: 13.1, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", Valor_luz: 13.2, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", Valor_luz: 13.3, max_R_nom: 400, min_R_nom: 100 } ],},
        { palanquilla: 140, pasadas: [ { id: "AH", Valor_luz: 14.1, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", Valor_luz: 14.2, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", Valor_luz: 14.3, max_R_nom: 400, min_R_nom: 100 } ],},
        { palanquilla: 150, pasadas: [ { id: "AH", Valor_luz: 15.1, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", Valor_luz: 15.2, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", Valor_luz: 15.3, max_R_nom: 400, min_R_nom: 100 } ],},
        { palanquilla: 160, pasadas: [ { id: "AH", Valor_luz: 16.1, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", Valor_luz: 16.2, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", Valor_luz: 16.3, max_R_nom: 400, min_R_nom: 100  } ] }
    ];

    const R_BDM = [ 
        { palanquilla: 130, pasadas: [ { id: "AH", R_transfor: 1.3, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", R_transfor: 1.3, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", R_transfor: 1.3, max_R_nom: 400, min_R_nom: 100  } ],},
        { palanquilla: 140, pasadas: [ { id: "AH", R_transfor: 1.4, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", R_transfor: 1.4, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", R_transfor: 1.4, max_R_nom: 400, min_R_nom: 100 } ],},
        { palanquilla: 150, pasadas: [ { id: "AH", R_transfor: 1.5, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", R_transfor: 1.5, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", R_transfor: 1.5, max_R_nom: 400, min_R_nom: 100 } ],},
        { palanquilla: 160, pasadas: [ { id: "AH", R_transfor: 1.6, max_R_nom: 400, min_R_nom: 100 }, { id: "BH", R_transfor: 1.6, max_R_nom: 400, min_R_nom: 100 }, { id: "CV", R_transfor: 1.6, max_R_nom: 400, min_R_nom: 100 } ] }
=======
        { palanquilla: 130, pasadas: [ { id: "AH", Valor_luz: 13.1, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", Valor_luz: 13.2, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", Valor_luz: 13.3, R_Tabla_max: 400, R_Tabla_min: 100 } ],},
        { palanquilla: 140, pasadas: [ { id: "AH", Valor_luz: 14.1, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", Valor_luz: 14.2, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", Valor_luz: 14.3, R_Tabla_max: 400, R_Tabla_min: 100 } ],},
        { palanquilla: 150, pasadas: [ { id: "AH", Valor_luz: 15.1, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", Valor_luz: 15.2, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", Valor_luz: 15.3, R_Tabla_max: 400, R_Tabla_min: 100 } ],},
        { palanquilla: 160, pasadas: [ { id: "AH", Valor_luz: 16.1, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", Valor_luz: 16.2, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", Valor_luz: 16.3, R_Tabla_max: 400, R_Tabla_min: 100  } ] }
    ];

    const R_BDM = [ 
        { palanquilla: 130, pasadas: [ { id: "AH", R_transfor: 1.3, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", R_transfor: 1.3, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", R_transfor: 1.3, R_Tabla_max: 400, R_Tabla_min: 100  } ],},
        { palanquilla: 140, pasadas: [ { id: "AH", R_transfor: 1.4, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", R_transfor: 1.4, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", R_transfor: 1.4, R_Tabla_max: 400, R_Tabla_min: 100 } ],},
        { palanquilla: 150, pasadas: [ { id: "AH", R_transfor: 1.5, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", R_transfor: 1.5, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", R_transfor: 1.5, R_Tabla_max: 400, R_Tabla_min: 100 } ],},
        { palanquilla: 160, pasadas: [ { id: "AH", R_transfor: 1.6, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "BH", R_transfor: 1.6, R_Tabla_max: 400, R_Tabla_min: 100 }, { id: "CV", R_transfor: 1.6, R_Tabla_max: 400, R_Tabla_min: 100 } ] }
>>>>>>> rama-temporal:js/pasadas.js
    ];

    const radioSeleccionado = document.querySelector('input[name="palanquilla"]:checked');
    if (!radioSeleccionado) return { luces: [], R: [] };

    const int_palan_selec = parseInt(radioSeleccionado.value, 10);

    const luz = luces_BDM.find(item => item.palanquilla === int_palan_selec);
    const R = R_BDM.find(item => item.palanquilla === int_palan_selec);

    return {
        luces: (luz && luz.pasadas) ? luz.pasadas : [],
        R: (R && R.pasadas) ? R.pasadas : []
    };
}

// 2. Variable global para almacenar el estado actual mutable del array de pasadas
export let pasadas_55 = [];

// 3. Función generadora que inyecta dinámicamente los valores correspondientes
export function generarPasadas55() {
    const datosBDM = luces_R_palanquilla();

    const luzAH = datosBDM.luces.find(p => p.id === "AH")?.Valor_luz ?? 10;
    const rTransAH = datosBDM.R.find(p => p.id === "AH")?.R_transfor ?? 1.5;

    const luzBH = datosBDM.luces.find(p => p.id === "BH")?.Valor_luz ?? 5;
    const rTransBH = datosBDM.R.find(p => p.id === "BH")?.R_transfor ?? 1.5;

    const luzCV = datosBDM.luces.find(p => p.id === "CV")?.Valor_luz ?? 5;
    const rTransCV = datosBDM.R.find(p => p.id === "CV")?.R_transfor ?? 1.5;

    // Tus datos teóricos originales inalterados
    pasadas_55 = [
<<<<<<< HEAD:Laminación/js/pasadas.js
        { id: "AH", nombre: "AH",   tipo: "AH",        B: 180.0,   H: 46,      R: 120,     r: 8,   a: 12,  n: n_puntos,        Valor_luz: luzAH,      R_transfor: rTransAH, max_R_nom: 750,    min_R_nom: 650   },
        { id: "BH", nombre: "BH",   tipo: "ovalo",     B: 209.37,  H: 39,      R: 160,     r: 10,  a: 0,   n: n_puntos,        Valor_luz: luzBH,      R_transfor: rTransBH, max_R_nom: 750,    min_R_nom: 650   },
        { id: "CV", nombre: "CV",   tipo: "redondo",   B: 120.09,  H: 49,      R: 55,      r: 8,   a: 30,  n: n_puntos,        Valor_luz: luzCV,      R_transfor: rTransCV, max_R_nom: 750,    min_R_nom: 650   },
        { id: "C1", nombre: "C1",    tipo: "C1",       B: 140,     H: 35,      R1: 160,    R2: 40, r: 8,   a: 0, n: n_puntos,  Valor_luz: 11,         R_transfor: 1.116,    max_R_nom: 540,    min_R_nom: 450   },
        { id: "C2", nombre: "C2",   tipo: "ovalo",     B: 146.64,  H: 28,      R: 110,     r: 8,   a: 0,   n: n_puntos,        Valor_luz: 12,         R_transfor: 1.183,    max_R_nom: 540,    min_R_nom: 450   },
        { id: "C3", nombre: "C3",   tipo: "redondo",   B: 90.3,    H: 36,      R: 42.2,    r: 6,   a: 30, n: n_puntos,         Valor_luz: 16,         R_transfor: 1.21,     max_R_nom: 540,    min_R_nom: 450   },
        { id: "C4", nombre: "C4",   tipo: "ovalo",     B: 112.62,  H: 21,      R: 86,      r: 6,   a: 0,   n: n_puntos,        Valor_luz: 12,         R_transfor: 1.227,    max_R_nom: 540,    min_R_nom: 450   },
        { id: "C5", nombre: "C5",   tipo: "redondo",   B: 69.28,   H: 27,      R: 33,      r: 4,   a: 30,  n: n_puntos,        Valor_luz: 12,         R_transfor: 1.219,    max_R_nom: 458,    min_R_nom: 370   },
        { id: "C6", nombre: "C6",   tipo: "ovalo",     B: 86.16,   H: 16,      R: 66,      r: 6,   a: 0,   n: n_puntos,        Valor_luz: 10,         R_transfor: 1.228,    max_R_nom: 458,    min_R_nom: 370   },
        { id: "C7", nombre: "C7",   tipo: "redondo",   B: 53.12,   H: 21,      R: 25,      r: 4,   a: 30,  n: n_puntos,        Valor_luz: 9.5,        R_transfor: 1.213,    max_R_nom: 458,    min_R_nom: 370   },
        { id: "C8", nombre: "C8",   tipo: "ovalo",     B: 65.36,   H: 12,      R: 50.5,    r: 4,   a: 0,   n: n_puntos,        Valor_luz: 9,          R_transfor: 1.22,     max_R_nom: 402,    min_R_nom: 320   },
        { id: "C9", nombre: "C9",   tipo: "redondo",   B: 42.15,   H: 16.5,    R: 20,      r: 4,   a: 30,  n: n_puntos,        Valor_luz: 6.5,        R_transfor: 1.22,     max_R_nom: 402,    min_R_nom: 320   },
        { id: "C10", nombre: "C10", tipo: "ovalo",     B: 52.65,   H: 9,       R: 43,      r: 4,   a: 0,   n: n_puntos,        Valor_luz: 6.8,        R_transfor: 1.225,    max_R_nom: 402,    min_R_nom: 320   },
        { id: "C11", nombre: "C11", tipo: "redondo",   B: 33.20,   H: 13,      R: 15.75,   r: 3,   a: 30,  n: n_puntos,        Valor_luz: 4.7,        R_transfor: 1.3,      max_R_nom: 402,    min_R_nom: 320   },
        { id: "C12", nombre: "C12", tipo: "ovalo",     B: 39.33,   H: 8.5,     R: 27,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 5,          R_transfor: 1.3,      max_R_nom: 330,    min_R_nom: 302   },
        { id: "C13", nombre: "C13", tipo: "redondo",   B: 26.79,   H: 10.7,    R: 12.5,    r: 1.5, a: 30,  n: n_puntos,        Valor_luz: 5,          R_transfor: 1.3,      max_R_nom: 330,    min_R_nom: 302   },
        { id: "C14", nombre: "C14", tipo: "ovalo",     B: 35.46,   H: 5.8,     R: 30,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 5,          R_transfor: 1.3,      max_R_nom: 330,    min_R_nom: 302   },
        { id: "C15", nombre: "C15", tipo: "redondo",   B: 20.78,   H : 8.2,    R: 9.8,     r: 1.5, a: 30,  n: n_puntos,        Valor_luz: 5,          R_transfor: 1.13,     max_R_nom: 330,    min_R_nom: 302   },
        { id: "C16", nombre: "C16", tipo: "ovalo",     B: 27.95,   H: 5.5,     R: 20.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 3,          R_transfor: 1.3,      max_R_nom: 210.5,  min_R_nom: 187.5 },
        { id: "C17", nombre: "C17", tipo: "redondo",   B: 17.9,    H: 7,       R: 8.5,     r: 1.5, a: 30,  n: n_puntos,        Valor_luz: 3.15,       R_transfor: 1.3,      max_R_nom: 210.5,  min_R_nom: 187.5 },
        { id: "C18", nombre: "C18", tipo: "ovalo",     B: 21.22,   H: 4.2,     R: 15.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 3.27,       R_transfor: 1.3,      max_R_nom: 210.5,  min_R_nom: 187.5 },
        { id: "C19", nombre: "C19", tipo: "redondo",   B: 12.9,    H: 5.5,     R: 6.35,    r: 0,   a: 20,  n: n_puntos,        Valor_luz: 2.1,        R_transfor: 1.3,      max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C20", nombre: "C20", tipo: "ovalo",     B: 18.89,   H: 3.5,     R: 14.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 2.11,       R_transfor: 1.13,     max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C21", nombre: "C21", tipo: "redondo",   B: 11.3,    H: 4.75,    R: 5.6,     r: 0,   a: 20,  n: n_puntos,        Valor_luz: 1.85,       R_transfor: 1.13,     max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C22", nombre: "C22", tipo: "ovalo",     B: 18.89,   H: 3.5,     R: 14.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 1.19,       R_transfor: 1.13,     max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C23", nombre: "C23", tipo: "redondo",   B: 9.42,    H: 3.8,     R: 4.56,    r: 0,   a: 25,  n: n_puntos,        Valor_luz: 1.4,        R_transfor: 1.3,      max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C24", nombre: "C24", tipo: "ovalo",     B: 13.56,   H: 2.1,     R: 12,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 1.1,        R_transfor: 1.3,      max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C25", nombre: "C25", tipo: "redondo",   B: 7.69,    H: 3.1,     R: 3.68,    r: 0,   a: 25,  n: n_puntos,        Valor_luz: 0.9,        R_transfor: 1.3,      max_R_nom: 158.75, min_R_nom: 142.5 },
        { id: "C26", nombre: "C26", tipo: "ovalo",     B: 9.48,    H: 1.35,    R: 19,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 1.2,        R_transfor: 1.246,    max_R_nom: 228.34, min_R_nom: 205   },
        { id: "C27", nombre: "C27", tipo: "RSM",       B: 6.22,    H: 2.45,    R: 2.74,    a: 100, z: 2,   n: n_puntos,        Valor_luz: 1.25,       R_transfor: 1.158,    max_R_nom: 228.34, min_R_nom: 205   },
        { id: "C28", nombre: "C28", tipo: "RSM",       B: 6.43,    H: 2.24,    R: 2.96,    a: 90,  z: 3,   n: n_puntos,        Valor_luz: 1.2,        R_transfor: 1.1071,   max_R_nom: 156,    min_R_nom: 152   },
        { id: "C29", nombre: "C29", tipo: "RSM",       B: 5.87,    H: 2.29,    R: 2.79,    a: 117, z: 3,   n: n_puntos,        Valor_luz: 1.2,        R_transfor: 1.045,    max_R_nom: 156,    min_R_nom: 152   }, 
    ];

    // --- ACTUALIZACIÓN DINÁMICA DESDE LOCALSTORAGE ---
    // Si se modificaron valores en la página de detalle, se sobreescriben aquí sin perder la estructura base.
    pasadas_55.forEach(p => {
        const guardado = localStorage.getItem(`pasada_${p.id}`);
        if (guardado) {
            const datosModificados = JSON.parse(guardado);
            if (datosModificados.B !== undefined) p.B = datosModificados.B;
            if (datosModificados.H !== undefined) p.H = datosModificados.H;
            if (datosModificados.R !== undefined) p.R = datosModificados.R;
            if (datosModificados.r !== undefined) p.r = datosModificados.r;
            if (datosModificados.a !== undefined) p.a = datosModificados.a;
            if (datosModificados.R1 !== undefined) p.R1 = datosModificados.R1;
            if (datosModificados.R2 !== undefined) p.R2 = datosModificados.R2;
            if (datosModificados.n !== undefined) p.n = datosModificados.n;
            if (datosModificados.Valor_luz !== undefined) p.Valor_luz = datosModificados.Valor_luz;
=======
        { id: "AH", nombre: "AH",   tipo: "AH",        B: 180.0,   H: 46,      R: 120,     r: 8,   a: 12,  n: n_puntos,        Valor_luz: luzAH,      R_transfor: rTransAH, R_Tabla_max: 750,    R_Tabla_min: 650   },
        { id: "BH", nombre: "BH",   tipo: "ovalo",     B: 209.37,  H: 39,      R: 160,     r: 10,  a: 0,   n: n_puntos,        Valor_luz: luzBH,      R_transfor: rTransBH, R_Tabla_max: 750,    R_Tabla_min: 650   },
        { id: "CV", nombre: "CV",   tipo: "redondo",   B: 120.09,  H: 49,      R: 55,      r: 8,   a: 30,  n: n_puntos,        Valor_luz: luzCV,      R_transfor: rTransCV, R_Tabla_max: 750,    R_Tabla_min: 650   },
        { id: "C1", nombre: "C1",    tipo: "C1",       B: 140,     H: 35,      R1: 160,    R2: 40, r: 8,   a: 0, n: n_puntos,  Valor_luz: 11,         R_transfor: 1.116,    R_Tabla_max: 540,    R_Tabla_min: 450   },
        { id: "C2", nombre: "C2",   tipo: "ovalo",     B: 146.64,  H: 28,      R: 110,     r: 8,   a: 0,   n: n_puntos,        Valor_luz: 12,         R_transfor: 1.183,    R_Tabla_max: 540,    R_Tabla_min: 450   },
        { id: "C3", nombre: "C3",   tipo: "redondo",   B: 90.3,    H: 36,      R: 42.2,    r: 6,   a: 30, n: n_puntos,         Valor_luz: 16,         R_transfor: 1.21,     R_Tabla_max: 540,    R_Tabla_min: 450   },
        { id: "C4", nombre: "C4",   tipo: "ovalo",     B: 112.62,  H: 21,      R: 86,      r: 6,   a: 0,   n: n_puntos,        Valor_luz: 12,         R_transfor: 1.227,    R_Tabla_max: 540,    R_Tabla_min: 450   },
        { id: "C5", nombre: "C5",   tipo: "redondo",   B: 69.28,   H: 27,      R: 33,      r: 4,   a: 30,  n: n_puntos,        Valor_luz: 12,         R_transfor: 1.219,    R_Tabla_max: 458,    R_Tabla_min: 370   },
        { id: "C6", nombre: "C6",   tipo: "ovalo",     B: 86.16,   H: 16,      R: 66,      r: 6,   a: 0,   n: n_puntos,        Valor_luz: 10,         R_transfor: 1.228,    R_Tabla_max: 458,    R_Tabla_min: 370   },
        { id: "C7", nombre: "C7",   tipo: "redondo",   B: 53.12,   H: 21,      R: 25,      r: 4,   a: 30,  n: n_puntos,        Valor_luz: 9.5,        R_transfor: 1.213,    R_Tabla_max: 458,    R_Tabla_min: 370   },
        { id: "C8", nombre: "C8",   tipo: "ovalo",     B: 65.36,   H: 12,      R: 50.5,    r: 4,   a: 0,   n: n_puntos,        Valor_luz: 9,          R_transfor: 1.22,     R_Tabla_max: 402,    R_Tabla_min: 320   },
        { id: "C9", nombre: "C9",   tipo: "redondo",   B: 42.15,   H: 16.5,    R: 20,      r: 4,   a: 30,  n: n_puntos,        Valor_luz: 6.5,        R_transfor: 1.22,     R_Tabla_max: 402,    R_Tabla_min: 320   },
        { id: "C10", nombre: "C10", tipo: "ovalo",     B: 52.65,   H: 9,       R: 43,      r: 4,   a: 0,   n: n_puntos,        Valor_luz: 6.8,        R_transfor: 1.225,    R_Tabla_max: 402,    R_Tabla_min: 320   },
        { id: "C11", nombre: "C11", tipo: "redondo",   B: 33.20,   H: 13,      R: 15.75,   r: 3,   a: 30,  n: n_puntos,        Valor_luz: 4.7,        R_transfor: 1.3,      R_Tabla_max: 402,    R_Tabla_min: 320   },
        { id: "C12", nombre: "C12", tipo: "ovalo",     B: 39.33,   H: 8.5,     R: 27,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 5,          R_transfor: 1.3,      R_Tabla_max: 330,    R_Tabla_min: 302   },
        { id: "C13", nombre: "C13", tipo: "redondo",   B: 26.79,   H: 10.7,    R: 12.5,    r: 1.5, a: 30,  n: n_puntos,        Valor_luz: 5,          R_transfor: 1.3,      R_Tabla_max: 330,    R_Tabla_min: 302   },
        { id: "C14", nombre: "C14", tipo: "ovalo",     B: 35.46,   H: 5.8,     R: 30,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 5,          R_transfor: 1.3,      R_Tabla_max: 330,    R_Tabla_min: 302   },
        { id: "C15", nombre: "C15", tipo: "redondo",   B: 20.78,   H : 8.2,    R: 9.8,     r: 1.5, a: 30,  n: n_puntos,        Valor_luz: 5,          R_transfor: 1.13,     R_Tabla_max: 330,    R_Tabla_min: 302   },
        { id: "C16", nombre: "C16", tipo: "ovalo",     B: 27.95,   H: 5.5,     R: 20.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 3,          R_transfor: 1.3,      R_Tabla_max: 210.5,  R_Tabla_min: 187.5 },
        { id: "C17", nombre: "C17", tipo: "redondo",   B: 17.9,    H: 7,       R: 8.5,     r: 1.5, a: 30,  n: n_puntos,        Valor_luz: 3.15,       R_transfor: 1.3,      R_Tabla_max: 210.5,  R_Tabla_min: 187.5 },
        { id: "C18", nombre: "C18", tipo: "ovalo",     B: 21.22,   H: 4.2,     R: 15.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 3.27,       R_transfor: 1.3,      R_Tabla_max: 210.5,  R_Tabla_min: 187.5 },
        { id: "C19", nombre: "C19", tipo: "redondo",   B: 12.9,    H: 5.5,     R: 6.35,    r: 0,   a: 20,  n: n_puntos,        Valor_luz: 2.1,        R_transfor: 1.3,      R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C20", nombre: "C20", tipo: "ovalo",     B: 18.89,   H: 3.5,     R: 14.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 2.11,       R_transfor: 1.13,     R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C21", nombre: "C21", tipo: "redondo",   B: 11.3,    H: 4.75,    R: 5.6,     r: 0,   a: 20,  n: n_puntos,        Valor_luz: 1.85,       R_transfor: 1.13,     R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C22", nombre: "C22", tipo: "ovalo",     B: 18.89,   H: 3.5,     R: 14.5,    r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 1.19,       R_transfor: 1.13,     R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C23", nombre: "C23", tipo: "redondo",   B: 9.42,    H: 3.8,     R: 4.56,    r: 0,   a: 25,  n: n_puntos,        Valor_luz: 1.4,        R_transfor: 1.3,      R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C24", nombre: "C24", tipo: "ovalo",     B: 13.56,   H: 2.1,     R: 12,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 1.1,        R_transfor: 1.3,      R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C25", nombre: "C25", tipo: "redondo",   B: 7.69,    H: 3.1,     R: 3.68,    r: 0,   a: 25,  n: n_puntos,        Valor_luz: 0.9,        R_transfor: 1.3,      R_Tabla_max: 158.75, R_Tabla_min: 142.5 },
        { id: "C26", nombre: "C26", tipo: "ovalo",     B: 9.48,    H: 1.35,    R: 19,      r: 1.5, a: 0,   n: n_puntos,        Valor_luz: 1.2,        R_transfor: 1.246,    R_Tabla_max: 228.34, R_Tabla_min: 205   },
        { id: "C27", nombre: "C27", tipo: "RSM",       B: 6.22,    H: 2.45,    R: 2.74,    a: 100, z: 2,   n: n_puntos,        Valor_luz: 1.25,       R_transfor: 1.158,    R_Tabla_max: 228.34, R_Tabla_min: 205   },
        { id: "C28", nombre: "C28", tipo: "RSM",       B: 6.43,    H: 2.24,    R: 2.96,    a: 90,  z: 3,   n: n_puntos,        Valor_luz: 1.2,        R_transfor: 1.1071,   R_Tabla_max: 156,    R_Tabla_min: 152   },
        { id: "C29", nombre: "C29", tipo: "RSM",       B: 5.87,    H: 2.29,    R: 2.79,    a: 117, z: 3,   n: n_puntos,        Valor_luz: 1.2,        R_transfor: 1.045,    R_Tabla_max: 156,    R_Tabla_min: 152   }, 
    ];

    // --- ACTUALIZACIÓN DINÁMICA DESDE LOCALSTORAGE ---
    pasadas_55.forEach(p => {
        // Asignar límites por defecto desde Diametro_cilin si existen
        const diamInfo = Diametro_cilin.find(d => d.id === p.id);
        if (diamInfo) {
            p.R_Tabla_max = diamInfo.max;
            p.R_Tabla_min = diamInfo.min;
        }

        const guardado = localStorage.getItem(`pasada_${p.id}`);
        if (guardado) {
            const datosModificados = JSON.parse(guardado);
            if (datosModificados.B_modificado !== undefined) p.B = datosModificados.B_modificado;
            if (datosModificados.H_modificado !== undefined) p.H = datosModificados.H_modificado;
            if (datosModificados.R_modificado !== undefined) p.R = datosModificados.R_modificado;
            if (datosModificados.r_modificado !== undefined) p.r = datosModificados.r_modificado;
            if (datosModificados.a_modificado !== undefined) p.a = datosModificados.a_modificado;
            if (datosModificados.R1_modificado !== undefined) p.R1 = datosModificados.R1_modificado;
            if (datosModificados.R2_modificado !== undefined) p.R2 = datosModificados.R2_modificado;
            if (datosModificados.n_modificado !== undefined) p.n = datosModificados.n_modificado;
            if (datosModificados.Valor_luz_modificado !== undefined) p.Valor_luz = datosModificados.Valor_luz_modificado;
            
            if (datosModificados.R_Tabla_modificado !== undefined) {
                p.R_Tabla_modificado = datosModificados.R_Tabla_modificado;
                let R_orig = (p.R_Tabla_max + p.R_Tabla_min) / 2;
                let dif = datosModificados.R_Tabla_modificado - R_orig;
                p.R_Tabla_max += dif;
                p.R_Tabla_min += dif;
            }
>>>>>>> rama-temporal:js/pasadas.js
        }
    });

    return pasadas_55;
}


const Diametro_cilin=[
{ id: "AH",  max: 750,    min: 650   },
{ id: "BH",  max: 750,    min: 650   },
{ id: "CV",  max: 750,    min: 650   },
{ id: "C1",  max: 540,    min: 450   },
{ id: "C2",  max: 540,    min: 450   },
{ id: "C3",  max: 540,    min: 450   },
{ id: "C4",  max: 540,    min: 450   },
{ id: "C5",  max: 458,    min: 370   },
{ id: "C6",  max: 458,    min: 370   },
{ id: "C7",  max: 458,    min: 370   },
{ id: "C8",  max: 402,    min: 320   },
{ id: "C9",  max: 402,    min: 320   },
{ id: "C10", max: 402,    min: 320   },
{ id: "C11", max: 402,    min: 320   },
{ id: "C12", max: 330,    min: 302   },
{ id: "C13", max: 330,    min: 302   },
{ id: "C14", max: 330,    min: 302   },
{ id: "C15", max: 330,    min: 302   },
{ id: "C16", max: 210.5,  min: 187.5 },
{ id: "C17", max: 210.5,  min: 187.5 },
{ id: "C18", max: 210.5,  min: 187.5 },
{ id: "C19", max: 158.75, min: 142.3 },
{ id: "C20", max: 158.75, min: 142.3 },
{ id: "C21", max: 158.75, min: 142.3 },
{ id: "C22", max: 158.75, min: 142.3 },
{ id: "C23", max: 158.75, min: 142.3 },
{ id: "C24", max: 158.75, min: 142.3 },
{ id: "C25", max: 158.75, min: 142.3 },
{ id: "C26", max: 228.34, min:  205  },
{ id: "C27", max: 228.34, min:  205  },
{ id: "C28", max: 156,    min:  142  },
{ id: "C29", max: 156,    min:  142  },
];
