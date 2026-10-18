const R_BDM =  [{palanquilla: 130, pasadas: [{ id: "AH", R_transfor: 1.5 }, { id: "BH", R_transfor: 1.5 }, { id: "CV", R_transfor: 1.5 }]},
                {palanquilla: 140, pasadas: [{ id: "AH", R_transfor: 1.5 }, { id: "BH", R_transfor: 1.5 }, { id: "CV", R_transfor: 1.5 }]},
                {palanquilla: 150, pasadas: [{ id: "AH", R_transfor: 1.5 }, { id: "BH", R_transfor: 1.5 }, { id: "CV", R_transfor: 1.5 }]},
                {palanquilla: 160, pasadas: [{ id: "AH", R_transfor: 1.5 }, { id: "BH", R_transfor: 1.5 }, { id: "CV", R_transfor: 1.5 }]}];



const R_CONT=[]


/* ===================================== NTM ================================================*/



const R_REYNOLDS_4c=[]

const R_NTM_4c = []


/*========================================= RSM ===============================================*/
const R_RSM_4c =[
  { perfil: 5.5,  pasadas:  [{ id: "26", R: 1.246 }, { id: "C27", R: 1.158 }, { id: "C28", R: 1.071 }, { id: "C29", R: 1.045 }] },
  { perfil: 6,    pasadas:  [{ id: "26", R: 1.12  }, { id: "C27", R: 1.113 }, { id: "C28", R: 1.057 }, { id: "C29", R: 1.034 }] },
  { perfil: 6.5,  pasadas:  [{ id: "26", R: 1.314 }, { id: "C27", R: 1.193 }, { id: "C28", R: 1.097 }, { id: "C29", R: 1.054 }] },
  { perfil: 7,    pasadas:  [{ id: "26", R: 1.189 }, { id: "C27", R: 1.15  }, { id: "C28", R: 1.091 }, { id: "C29", R: 1.054 }] },
  { perfil: 7.5,  pasadas:  [{ id: "26", R: 1.137 }, { id: "C27", R: 1.124 }, { id: "C28", R: 1.044 }, { id: "C29", R: 1.027 }] },
  { perfil: 8,    pasadas:  [{ id: "26", R: 1.328 }, { id: "C27", R: 1.21  }, { id: "C28", R: 1.121 }, { id: "C29", R: 1.069 }] },
  { perfil: 8.5,  pasadas:  [{ id: "26", R: 1.231 }, { id: "C27", R: 1.171 }, { id: "C28", R: 1.114 }, { id: "C29", R: 1.063 }] },
  { perfil: 9,    pasadas:  [{ id: "26", R: 1.146 }, { id: "C27", R: 1.13  }, { id: "C28", R: 1.107 }, { id: "C29", R: 1.062 }] },
  { perfil: 9.5,  pasadas:  [{ id: "26", R: 1.205 }, { id: "C27", R: 1.129 }, { id: "C28", R: 1.031 }, { id: "C29", R: 1.021 }] },
  { perfil: 10,   pasadas:  [{ id: "26", R: 1.322 }, { id: "C27", R: 1.225 }, { id: "C28", R: 1.128 }, { id: "C29", R: 1.075 }] },
  { perfil: 10.5, pasadas:  [{ id: "26", R: 1.322 }, { id: "C27", R: 1.225 }, { id: "C28", R: 1.061 }, { id: "C29", R: 1.037 }] },
  { perfil: 11,   pasadas:  [{ id: "26", R: 1.25  }, { id: "C27", R: 1.187 }, { id: "C28", R: 1.056 }, { id: "C29", R: 1.035 }] },
  { perfil: 11.5, pasadas:  [{ id: "26", R: 1.189 }, { id: "C27", R: 1.146 }, { id: "C28", R: 1.053 }, { id: "C29", R: 1.034 }] },
  { perfil: 12,   pasadas:  [{ id: "26", R: 1.375 }, { id: "C27", R: 1.262 }, { id: "C28", R: 1.105 }, { id: "C29", R: 1.104 }] },
  { perfil: 12.5, pasadas:  [{ id: "26", R: 1.278 }, { id: "C27", R: 1.213 }, { id: "C28", R: 1.128 }, { id: "C29", R: 1.073 }] },
  { perfil: 13,   pasadas:  [{ id: "26", R: 1.278 }, { id: "C27", R: 1.213 }, { id: "C28", R: 1.073 }, { id: "C29", R: 1.043 }] },
  { perfil: 13.5, pasadas:  [{ id: "26", R: 1.217 }, { id: "C27", R: 1.186 }, { id: "C28", R: 1.07  }, { id: "C29", R: 1.042 }] },
  { perfil: 14,   pasadas:  [{ id: "26", R: 1.192 }, { id: "C27", R: 1.168 }, { id: "C28", R: 1.045 }, { id: "C29", R: 1.028 }] },
  { perfil: 15,   pasadas:  [{ id: "26", R: 1.283 }, { id: "C27", R: 1.226 }, { id: "C28", R: 1.127 }, { id: "C29", R: 1.074 }] },
  { perfil: 16,   pasadas:  [{ id: "26", R: 1.283 }, { id: "C27", R: 1.226 }, { id: "C28", R: 1.037 }, { id: "C29", R: 1.025 }] },
  { perfil: 17,   pasadas:  [{ id: "26", R: 1.191 }, { id: "C27", R: 1.174 }, { id: "C28", R: 1.036 }, { id: "C29", R: 1.023 }] },
  { perfil: 18,   pasadas:  [{ id: "26", R: 1.316 }, { id: "C27", R: 1.255 }, { id: "C28", R: 1.124 }, { id: "C29", R: 1.071 }] },
  { perfil: 19,   pasadas:  [{ id: "26", R: 1.261 }, { id: "C27", R: 1.216 }, { id: "C28", R: 1.098 }, { id: "C29", R: 1.059 }] },
  { perfil: 20,   pasadas:  [{ id: "26", R: 1.218 }, { id: "C27", R: 1.197 }, { id: "C28", R: 1.063 }, { id: "C29", R: 1.038 }] },
  { perfil: 21,   pasadas:  [{ id: "26", R: 1.168 }, { id: "C27", R: 1.162 }, { id: "C28", R: 1.046 }, { id: "C29", R: 1.028 }] },
  { perfil: 22,   pasadas:  [{ id: "26", R: 1.319 }, { id: "C27", R: 1.265 }, { id: "C28", R: 1.101 }, { id: "C29", R: 1.058 }] }
];