const express = require('express');
const mysql = require('mysql2');
const consumer = require('./kafka');
const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: 'mysql-notification',
  user: 'root',
  password: 'root',
  database: 'notification_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
  });
  

// Consommation Kafka
async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notification', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const notif = JSON.parse(message.value.toString());
      db.query(
        'INSERT INTO notifications (idNotification, titre, contenu, dateEnvoie, conseille_id) VALUES (?, ?, ?, ?, ?)',
        [notif.idNotification, notif.titre, notif.contenu, notif.dateEnvoie, notif.conseille_id],
        err => {
          if (err) console.error('Erreur insertion notification :', err);
        }
      );
    }
  });
}

runConsumer();

// ✅ Route pour récupérer toutes les notifications
app.get('/notifications', (req, res) => {
  db.query('SELECT * FROM notifications', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ✅ Route pour récupérer les notifications d'un conseille
app.get('/notifications/:conseille_id', (req, res) => {
  const { conseille_id } = req.params;
  db.query(
    'SELECT * FROM notifications WHERE conseille_id = ? ORDER BY dateEnvoie DESC',
    [conseille_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.listen(3003, '0.0.0.0', () => console.log('Notification service on port 3003'));
