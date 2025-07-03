const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require ("@aws-sdk/client-sqs");
// Create an SQS client
const sqsClient = new SQSClient({ region: process.env.REGION });


module.exports.newOrder = async (event) => {
  const orderId = uuidv4();
  let orderDetails;

  try {
    orderDetails = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing order details: ", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON Format in order details" }),
    };
  }

  // ✅ Corrección: coma entre propiedades
  const order = { orderId, ...orderDetails };
  // en colamos la peticion
  await sendMessageToSQS(order);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: order
    }),
  };
};


module.exports.getOrder = async (event) => {
  // Registro del evento recibido (útil para debugging)
  console.log("evento:", event);

  // Obtiene el ID de la orden desde los parámetros de la ruta
  const orderId = event.pathParameters.orderId;

  // Detalles ficticios de la orden
  const orderDetails = {
    custumer: "Elizandro",
    pizza: "Peperoni",
    customerId: 1,
    orderStatus: "COMPLETE",
    size: "GRANDE",
    toppings: ["Queso", "Jamon", "Peperoni"],
    deliveryMethod: "A DOMICILIO",
    address: "123 COYOACAN, CDMEX",
    paymentMethod: "Credit Card",
    totalPrice: 18.99,
    orderTimestamp: new Date().toISOString()
  };

  // Crea el objeto completo de la orden
  const order = {
    orderId,
    ...orderDetails
  };

  // Imprime el objeto de la orden para seguimiento
  console.log("Order details:", order);

  // Devuelve la respuesta con el objeto de la orden
  return {
    statusCode: 200,
    body: JSON.stringify({ message: order })
  };
};

module.exports.preOrder = async (event) => {
  console.log( event);
  // Devuelve la respuesta con el objeto de la orden
  return 
};

async function sendMessageToSQS(message) {

  const params = {
    QueueUrl: process.env.PENDING_ORDERS_QUEUE,
    MessageBody: JSON.stringify(message)
  };

  console.log(params);

  try {
    const command = new SendMessageCommand(params);

    console.log( params );
    

    const data = await sqsClient.send(command);
    console.log("Message sent successfully:", data.MessageId);
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}