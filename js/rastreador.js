const TELEGRAM_TOKEN = '8312771041:AAGMYRyDRCTThBZn_CiZrfaEZZ6ySznd7C0';
const TELEGRAM_CHAT_ID = '583652892';

function enviarATelegram(texto) {
  const url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: texto
    })
  }).catch(error => console.error('Error enviando a Telegram:', error));
}

// Función principal que rastrea la conexión
function iniciarRastreo() {
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      
      // 1. CREAMOS LA FECHA Y HORA ACTUAL
      const ahora = new Date();
      // Formateamos a un formato local fácil de leer (ej: 19/10/2026, 12:54:30)
      const fechaHora = ahora.toLocaleString('es-ES'); 

      const contenedor = document.getElementById('info-visitante');
      if (contenedor) {
        contenedor.innerHTML = `
          <p>🕒 <strong>Fecha:</strong> ${fechaHora}</p>
          <p>🌐 <strong>Tu IP:</strong> ${data.ip}</p>
          <p>📍 <strong>Ubicación:</strong> ${data.city}, ${data.country_name}</p>
        `;
      }

      // 2. AÑADIMOS LA FECHA AL MENSAJE DE TELEGRAM
      // (He quitado los asteriscos * para que no se vea feo, ya que quitamos el Markdown)
      const mensajeTelegram = `🔔 ¡Nueva visita en el Tren de la Bruja!
🕒 Fecha y hora: ${fechaHora}
📍 IP: ${data.ip}
🌍 País: ${data.country_name}
🏙️ Ciudad: ${data.city}
🌐 Proveedor: ${data.org}`;

      enviarATelegram(mensajeTelegram);
    })
    .catch(error => {
      // También añadimos la fecha al mensaje de error por si falla el bloqueador
      const fechaError = new Date().toLocaleString('es-ES');
      enviarATelegram(`🔔 ¡Nueva visita! (${fechaError}) Pero un bloqueador impidió registrar la IP.`);
    });
}