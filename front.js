// Crear una nueva conexión WebSocket
//
// @const {WebSocket} ws - Instancia de WebSocket para la conexión con el servidor.
//
const ws = new WebSocket("ws://localhost:3000");

//
// Evento que se dispara cuando la conexión WebSocket se abre exitosamente.
//
ws.onopen = () => {
  // Intenta enviar un mensaje al servidor
  //
  // @method ws.send - Método para enviar datos a través del WebSocket.
  //
  try {
    ws.send("Hola, servidor!");
  } catch (error) {
    //
    // Maneja cualquier error que ocurra durante el envío del mensaje.
    //
    // @param {Error} error - Objeto de error que contiene información sobre el error.
    //
    console.error("Error al enviar mensaje:", error);
  }
};

//
// Evento que se dispara cuando se recibe un mensaje del servidor.
//
// @param {MessageEvent} event - Objeto de evento que contiene el mensaje del servidor.
//
ws.onmessage = (event) => {
  //
  // Imprime el mensaje recibido en la consola.
  //
  // @param {string} event.data - El mensaje recibido del servidor.
  //
  console.log(event.data);
};

//
// Evento que se dispara cuando la conexión WebSocket se cierra.
//
ws.onclose = () => {
  //
  // Aquí puedes manejar el cierre de la conexión, como intentar reconectar.
  //
};

//
// Evento que se dispara cuando ocurre un error en la conexión WebSocket.
//
// @param {Event} error - Objeto de evento que contiene información sobre el error.
//
ws.onerror = (error) => {
  //
  // Aquí puedes manejar el error, como mostrar un mensaje al usuario.
  //
};
