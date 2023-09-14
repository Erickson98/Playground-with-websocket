const http = require("http");
const crypto = require("crypto");

const clients = []; // Almacenar todas las conexiones WebSocket activas aquí

const server = http.createServer((req, res) => {
  // Manejar peticiones HTTP aquí (si es necesario)
});

server.on("upgrade", (req, socket, head) => {
  const key = crypto
    .createHash("sha1")
    .update(
      req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      "binary"
    )
    .digest("base64");

  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${key}`,
  ];

  socket.write(headers.join("\r\n") + "\r\n\r\n");
  clients.push(socket); // Añadir esta nueva conexión al arreglo de clientes

  socket.on("data", (buffer) => {
    const fin = Boolean(buffer[0] & 0b10000000);
    const opcode = buffer[0] & 0b00001111;
    const masked = Boolean(buffer[1] & 0b10000000);
    const payloadLength = buffer[1] & 0b01111111;
    const maskingKey = buffer.slice(2, 6);
    const payload = buffer.slice(6, 6 + payloadLength);

    if (fin && opcode === 1 && masked) {
      let decoded = "";

      for (let i = 0; i < payload.length; i++) {
        decoded += String.fromCharCode(payload[i] ^ maskingKey[i % 4]);
      }

      console.log("Mensaje recibido:", decoded);
    }
  });
  socket.on("close", () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1); // Eliminar esta conexión del arreglo de clientes
    }
  });
});

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

  console.log(`Enviando mensaje a ${clients.length} clientes.`);

  clients.forEach((client, index) => {
    if (client.writable) {
      // Verificar si el socket está abierto
      client.write(frameBuffer);
    } else {
      console.log(
        `El cliente en el índice ${index} no está abierto. Eliminando...`
      );
      clients.splice(index, 1); // Eliminar este cliente del arreglo
    }
  });
}

// Ejemplo de uso de la función broadcastMessage

setTimeout(() => {
  broadcastMessage("Hola a todos los clientes!");
}, 5000);
