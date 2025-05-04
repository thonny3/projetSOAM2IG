const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['kafka:9092'] });
const producer = kafka.producer();

async function sendNotificationEvent(data) {
  await producer.connect();
  await producer.send({
    topic: 'notification',
    messages: [{ value: JSON.stringify(data) }]
  });
  await producer.disconnect();
}

module.exports = { sendNotificationEvent };
