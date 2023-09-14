// Crear una nueva conexión WebSocket
const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  // Suscribirse a nuevos mensajes
  //   ws.send(JSON.stringify({ name: "newMessage" }));
  try {
    ws.send("Hola, servidor!");
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
};

ws.onmessage = (event) => {
  //   const message = JSON.parse(event.data);
  console.log(event.data);
  //   if (message.type === "newMessage") {
  //     // Actualizar la UI con el nuevo mensaje
  //   }
};

ws.onclose = () => {
  // Manejar cierre de conexión
};

ws.onerror = (error) => {
  // Manejar errores
};
