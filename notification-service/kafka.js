const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'notif-group' });

module.exports = consumer;
