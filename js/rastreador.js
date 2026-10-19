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
      // parse_mode: 'Markdown'  <-- Asegúrate de que esta línea NO esté
    })
  }).catch(error => console.error('Error enviando a Telegram:', error));
}

// Función principal que rastrea la conexión
function iniciarRastreo() {
  // /json/ al final para recibir los datos estructurados
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const contenedor = document.getElementById('info-visitante');
      if (contenedor) {
        contenedor.innerHTML = `
          <p>🌐 <strong>Tu IP:</strong> ${data.ip}</p>
          <p>📍 <strong>Ubicación:</strong> ${data.city}, ${data.country_name}</p>
        `;
      }

      const mensajeTelegram = `🔔 *¡Nueva visita en el Tren de la Bruja!*
📍 *IP:* ${data.ip}
🌍 *País:* ${data.country_name}
🏙️ *Ciudad:* ${data.city}
🌐 *Proveedor:* ${data.org}`;

      enviarATelegram(mensajeTelegram);
    })
    .catch(error => {
      enviarATelegram(`🔔 *Nueva visita*, pero un bloqueador impidió registrar la IP.`);
    });
}