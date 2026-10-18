
const luz_BDM = [
    {palanquilla: 130,pasadas: [{ id: "AH", Valor_luz: 10 },{ id: "BH", Valor_luz: 5 },{ id: "CV", Valor_luz: 5 }]},
    {palanquilla: 140,pasadas: [{ id: "AH", Valor_luz: 10 },{ id: "BH", Valor_luz: 5 },{ id: "CV", Valor_luz: 5 }]},
    {palanquilla: 150,pasadas: [{ id: "AH", Valor_luz: 10 },{ id: "BH", Valor_luz: 5 },{ id: "CV", Valor_luz: 5 }]},
    {palanquilla: 160,pasadas: [{ id: "AH", Valor_luz: 10 },{ id: "BH", Valor_luz: 5 },{ id: "CV", Valor_luz: 5 }]}];



/* ===================================== continuo ================================================*/

const luz_CONT =[ {id: "1",  Valor_luz: 11 },{id: "2",  Valor_luz: 12 },{id: "3",  Valor_luz: 16 },{id: "4",  Valor_luz: 12}, 
                    {id: "5",  Valor_luz: 12 },{id: "6",  Valor_luz: 10 },{id: "7",  Valor_luz: 9.5},{id: "8",  Valor_luz: 9 }, 
                    {id: "9",  Valor_luz: 6.5},{id: "10", Valor_luz: 6.8},{id: "11", Valor_luz: 4.7}]




/* ===================================== REYNOLDS ================================================*/

const luz_REYNOLDS_4c = [
  { perfil: 5.5,  pasadas: [{ id: "12", Valor_luz: 3.8 }, { id: "13", Valor_luz: 3.8 }, { id: "14", Valor_luz: 3.4 }, { id: "15", Valor_luz: 5.2 }] },
  { perfil: 6,    pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 6.5,  pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 7,    pasadas: [{ id: "12", Valor_luz: 3.8 }, { id: "13", Valor_luz: 3.8 }, { id: "14", Valor_luz: 3.4 }, { id: "15", Valor_luz: 5.2 }] },
  { perfil: 7.5,  pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 8,    pasadas: [{ id: "12", Valor_luz: 3.8 }, { id: "13", Valor_luz: 3.8 }, { id: "14", Valor_luz: 3.4 }, { id: "15", Valor_luz: 5.2 }] },
  { perfil: 8.5,  pasadas: [{ id: "12", Valor_luz: 3.8 }, { id: "13", Valor_luz: 3.8 }, { id: "14", Valor_luz: 3.4 }, { id: "15", Valor_luz: 5.2 }] },
  { perfil: 9,    pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 9.5,  pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 10,   pasadas: [{ id: "12", Valor_luz: 3.8 }, { id: "13", Valor_luz: 3.8 }, { id: "14", Valor_luz: 3.4 }, { id: "15", Valor_luz: 5.2 }] },
  { perfil: 10.5, pasadas: [{ id: "12", Valor_luz: 3.8 }, { id: "13", Valor_luz: 3.8 }, { id: "14", Valor_luz: 3.4 }, { id: "15", Valor_luz: 5.2 }] },
  { perfil: 11,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 11.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 12,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 12.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 13,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 13.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 14,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 14.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 15,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 15.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 16,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 16.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 17,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 17.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }, { id: "14", Valor_luz: 4.0 }, { id: "15", Valor_luz: 5.8 }] },
  { perfil: 18,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 18.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 19,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 19.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 20,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 20.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 21,   pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] },
  { perfil: 21.5, pasadas: [{ id: "12", Valor_luz: 4.4 }, { id: "13", Valor_luz: 4.0 }] }
];


const luz_REYNOLDS_2c = []




/* ===================================== NTM ================================================*/





const luz_NTM_4c = [
  { perfil: 5.5,  pasadas: [{ id: "16", Valor_luz: 3    }, { id: "17", Valor_luz: 3.15 }, { id: "18", Valor_luz: 3.27 }, { id: "19", Valor_luz: 2.0  }, { id: "20", Valor_luz: 2.1  }, { id: "21", Valor_luz: 1.85 }, { id: "22", Valor_luz: 1.19 }, { id: "23", Valor_luz: 1.4 }, { id: "24", Valor_luz: 1.1  }, { id: "25", Valor_luz: 0.9  }] },
  { perfil: 6,    pasadas: [{ id: "16", Valor_luz: 3.75 }, { id: "17", Valor_luz: 3.45 }, { id: "18", Valor_luz: 3.55 }, { id: "19", Valor_luz: 2.35 }, { id: "20", Valor_luz: 2.38 }, { id: "21", Valor_luz: 2.0  }, { id: "22", Valor_luz: 1.35 }, { id: "23", Valor_luz: 1.6 }, { id: "24", Valor_luz: 1.33 }, { id: "25", Valor_luz: 1.25 }] },
  { perfil: 6.5,  pasadas: [{ id: "16", Valor_luz: 3.7  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.2  }, { id: "20", Valor_luz: 2.2  }, { id: "21", Valor_luz: 1.96 }, { id: "22", Valor_luz: 1.43 }, { id: "23", Valor_luz: 1.4 }] },
  { perfil: 7,    pasadas: [{ id: "16", Valor_luz: 3.5  }, { id: "17", Valor_luz: 3.35 }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.0  }, { id: "20", Valor_luz: 2.1  }, { id: "21", Valor_luz: 1.85 }, { id: "22", Valor_luz: 1.19 }, { id: "23", Valor_luz: 1.4 }] },
  { perfil: 7.5,  pasadas: [{ id: "16", Valor_luz: 3.65 }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.2  }, { id: "20", Valor_luz: 2.22 }, { id: "21", Valor_luz: 1.96 }, { id: "22", Valor_luz: 1.3  }, { id: "23", Valor_luz: 1.5 }] },
  { perfil: 8,    pasadas: [{ id: "16", Valor_luz: 3.4  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.2  }, { id: "20", Valor_luz: 2.2  }, { id: "21", Valor_luz: 1.85 }] },
  { perfil: 8.5,  pasadas: [{ id: "16", Valor_luz: 3.5  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.2  }, { id: "20", Valor_luz: 2.2  }, { id: "21", Valor_luz: 1.85 }] },
  { perfil: 9,    pasadas: [{ id: "16", Valor_luz: 3.5  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.45 }, { id: "19", Valor_luz: 2.5  }, { id: "20", Valor_luz: 2.2  }, { id: "21", Valor_luz: 1.85 }] },
  { perfil: 9.5,  pasadas: [{ id: "16", Valor_luz: 3.7  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.2  }, { id: "20", Valor_luz: 2.22 }, { id: "21", Valor_luz: 1.96 }] },
  { perfil: 10,   pasadas: [{ id: "16", Valor_luz: 3.5  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.45 }, { id: "19", Valor_luz: 2.1  }] },
  { perfil: 10.5, pasadas: [{ id: "16", Valor_luz: 3.5  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.45 }, { id: "19", Valor_luz: 2.5  }] },
  { perfil: 11,   pasadas: [{ id: "16", Valor_luz: 3.8  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.22 }] },
  { perfil: 11.5, pasadas: [{ id: "16", Valor_luz: 3.6  }, { id: "17", Valor_luz: 3.4  }, { id: "18", Valor_luz: 3.48 }, { id: "19", Valor_luz: 2.22 }] },
  { perfil: 12,   pasadas: [{ id: "16", Valor_luz: 3.6  }, { id: "17", Valor_luz: 3.4  }] },
  { perfil: 12.5, pasadas: [{ id: "16", Valor_luz: 3.6  }, { id: "17", Valor_luz: 3.4  }] },
  { perfil: 13,   pasadas: [{ id: "16", Valor_luz: 3.6  }, { id: "17", Valor_luz: 3.4  }] },
  { perfil: 13.5, pasadas: [{ id: "16", Valor_luz: 0    }, { id: "17", Valor_luz: 0    }] },
  { perfil: 14,   pasadas: [{ id: "16", Valor_luz: 3.7  }, { id: "17", Valor_luz: 3.45 }] }
];
const luz_NTM_2c = []


/* ===================================== RSM ================================================*/



const luz_RSM_4c = [
  { perfil: 5.5, variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.3  }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.2  }, { id: "29", Valor_luz: 1.1 } ] },
  { perfil: 6,   variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.65 }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.2 } ] },
  { perfil: 6.5, variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.33 }, { id: "28", Valor_luz: 1.43 }, { id: "29", Valor_luz: 1.25 } ] },
  { perfil: 7,   variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.3 } ] },
  { perfil: 7,   variante: 2,  pasadas: [ { id: "26", Valor_luz: 1.35 }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.3 } ] },
  { perfil: 7.5, variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.24 } ] },
  { perfil: 7.5, variante: 2,  pasadas: [ { id: "26", Valor_luz: 1.45 }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.26 } ] },
  { perfil: 8,   variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.2 } ] },
  { perfil: 8.5, variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.25 } ] },
  { perfil: 8.5, variante: 2,  pasadas: [ { id: "26", Valor_luz: 1.35 }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.35 }, { id: "29", Valor_luz: 1.15 } ] },
  { perfil: 9,   variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.35 }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.4 } ] },
  { perfil: 9,   variante: 2,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.4 } ] },
  { perfil: 9.5, variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.6  }, { id: "27", Valor_luz: 1.3  }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.35 } ] },
  { perfil: 10,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.6  }, { id: "29", Valor_luz: 1.5 } ] },
  { perfil: 10,  variante: 2,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 10,  variante: 3,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.3  }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 10,  variante: 4,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.25 }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 10,  variante: 5,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.3  }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 10,  variante: 6,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.2  }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.4 } ] },
  { perfil: 10.5, variante: 1, pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.6  }, { id: "29", Valor_luz: 1.5 } ] },
  { perfil: 11,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.6  }, { id: "27", Valor_luz: 1.45 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 11.5, variante: 1, pasadas: [ { id: "26", Valor_luz: 1.55 }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.35 } ] },
  { perfil: 12,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.4 } ] },
  { perfil: 12.5, variante: 1, pasadas: [ { id: "26", Valor_luz: 1.45 }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.4 } ] },
  { perfil: 13,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.45 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.35 } ] },
  { perfil: 13.5, variante: 1, pasadas: [ { id: "26", Valor_luz: 1.45 }, { id: "27", Valor_luz: 1.45 }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 14,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.8  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.35 } ] },
  { perfil: 15,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.45 }, { id: "28", Valor_luz: 1.5  }, { id: "29", Valor_luz: 1.35 } ] },
  { perfil: 16,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.45 }, { id: "29", Valor_luz: 1.4 } ] },
  { perfil: 17,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.55 }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 18,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.4  }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.3 } ] },
  { perfil: 19,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.45 }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.3 } ] },
  { perfil: 20,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.45 }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.35 } ] },
  { perfil: 20,  variante: 2,  pasadas: [ { id: "26", Valor_luz: 1.5  }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.45 } ] },
  { perfil: 21,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.4  }, { id: "27", Valor_luz: 1.35 }, { id: "28", Valor_luz: 1.35 }, { id: "29", Valor_luz: 1.3 } ] },
  { perfil: 22,  variante: 1,  pasadas: [ { id: "26", Valor_luz: 1.55 }, { id: "27", Valor_luz: 1.3  }, { id: "28", Valor_luz: 1.4  }, { id: "29", Valor_luz: 1.3 } ] }
];

const luz_RSM_2c = [
  { perfil: 13, variante: 1, rodillos: 12, pasadas: [ { id: "26", Valor_luz: 1.5  },  { id: "27", Valor_luz: 1.3  } ] },
  { perfil: 14, variante: 1, rodillos: 13, pasadas: [ { id: "26", Valor_luz: 1.7  },  { id: "27", Valor_luz: 1.25 } ] },
  { perfil: 15, variante: 1, rodillos: 14, pasadas: [ { id: "26", Valor_luz: 1.8  },  { id: "27", Valor_luz: 1.65 } ] },
  { perfil: 16, variante: 1, rodillos: 16, pasadas: [ { id: "26", Valor_luz: 1.4  },  { id: "27", Valor_luz: 1.2  } ] },
  { perfil: 17, variante: 1, rodillos: 17, pasadas: [ { id: "26", Valor_luz: 1.6  },  { id: "27", Valor_luz: 1.15 } ] },
  { perfil: 18, variante: 1, rodillos: 18, pasadas: [ { id: "26", Valor_luz: 1.7  },  { id: "27", Valor_luz: 1.3  } ] },
  { perfil: 19, variante: 1, rodillos: 19, pasadas: [ { id: "26", Valor_luz: 1.3  },  { id: "27", Valor_luz: 1.2  } ] },
  { perfil: 20, variante: 1, rodillos: 20, pasadas: [ { id: "26", Valor_luz: 1.7  },  { id: "27", Valor_luz: 1.2  } ] },
  { perfil: 21, variante: 1, rodillos: 21, pasadas: [ { id: "26", Valor_luz: 1.7  },  { id: "27", Valor_luz: 1.15 } ] },
  { perfil: 22, variante: 1, rodillos: 22, pasadas: [ { id: "26", Valor_luz: 1.45 },  { id: "27", Valor_luz: 1.1  } ] },
  { perfil: 23, variante: 1, rodillos: 23, pasadas: [ { id: "26", Valor_luz: 1.65 },  { id: "27", Valor_luz: 1.1  } ] }
];
