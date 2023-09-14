const http = require("http");
const crypto = require("crypto");

// Almacenar todas las conexiones WebSocket activas aquí
const clients = [];

// Crear un servidor HTTP
const server = http.createServer((req, res) => {
  // Manejar peticiones HTTP aquí (si es necesario)
});

// Evento que se dispara cuando se solicita una actualización de protocolo a WebSocket
server.on("upgrade", (req, socket, head) => {
  // Generar la clave Sec-WebSocket-Accept para completar el handshake
  const key = crypto
    .createHash("sha1")
    .update(
      req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      "binary"
    )
    .digest("base64");

  // Encabezados para completar el handshake
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${key}`,
  ];

  // Enviar encabezados para completar el handshake
  socket.write(headers.join("\r\n") + "\r\n\r\n");

  // Añadir esta nueva conexión al arreglo de clientes
  clients.push(socket);

  // Evento que se dispara cuando se recibe un mensaje del cliente
  socket.on("data", (buffer) => {
    // Procesar el frame WebSocket
    const fin = Boolean(buffer[0] & 0b10000000);
    const opcode = buffer[0] & 0b00001111;
    const masked = Boolean(buffer[1] & 0b10000000);
    const payloadLength = buffer[1] & 0b01111111;
    const maskingKey = buffer.slice(2, 6);
    const payload = buffer.slice(6, 6 + payloadLength);

    // Si el frame es un mensaje de texto completo y está enmascarado
    if (fin && opcode === 1 && masked) {
      let decoded = "";
      for (let i = 0; i < payload.length; i++) {
        decoded += String.fromCharCode(payload[i] ^ maskingKey[i % 4]);
      }

      // Procesar el mensaje recibido
      console.log("Mensaje recibido:", decoded);
      try {
        const parsed = JSON.parse(decoded);
        if (parsed.command === "broadcast") {
          broadcastMessage(parsed.message);
        }
      } catch (error) {
        console.log("i'll pass");
      }
    }
  });

  // Evento que se dispara cuando el cliente cierra la conexión
  socket.on("close", () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      // Eliminar esta conexión del arreglo de clientes
      clients.splice(index, 1);
    }
  });
});

// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000/");
});

// Función para enviar un mensaje a todos los clientes
function broadcastMessage(message) {
  const payload = Buffer.from(message);
  const frame = [
    0b10000001, // FIN y opcode para texto
    payload.length, // Longitud de la carga útil
    ...payload, // Datos de la carga útil
  ];

  const frameBuffer = Buffer.from(frame);

  // Enviar el mensaje a todos los clientes conectados
  console.log(`Enviando mensaje a ${clients.length} clientes.`);
  clients.forEach((client, index) => {
    if (client.writable) {
      client.write(frameBuffer);
    } else {
      console.log(
        `El cliente en el índice ${index} no está abierto. Eliminando...`
      );
      clients.splice(index, 1);
    }
  });
}

// Enviar un mensaje de prueba a todos los clientes después de 5 segundos
setTimeout(() => {
  broadcastMessage("Hola a todos los clientes!");
}, 5000);
