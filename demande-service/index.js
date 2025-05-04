const express = require('express');
const mysql = require('mysql2');
const { sendNotificationEvent } = require('./kafka');
const app = express();
app.use(express.json());

// Connexion à la base de données demande_db
const demandeDB = mysql.createConnection({
  host: 'mysql-demande',
  user: 'root',
  password: 'root',
  database: 'demande_db'
});

// Connexion à la base de données employe_db (pour la jointure logique)
const employeDB = mysql.createConnection({
  host: 'mysql-employe',
  user: 'root',
  password: 'root',
  database: 'employe_db'
});

demandeDB.connect();
employeDB.connect();

// ➕ Créer une demande
app.post('/demandes', async (req, res) => {
  const { titre, type, details, status, employe_id, conseille_id } = req.body;

  const query = 'INSERT INTO demandes (titre, type, details, status, employe_id, conseille_id) VALUES (?, ?, ?, ?, ?, ?)';
  demandeDB.query(query, [titre, type, details, status, employe_id, conseille_id], async (err, result) => {
    if (err) return res.status(500).json(err);

    await sendNotificationEvent({
      idNotification: `notif_${result.insertId}`,
      titre: "Nouvelle demande",
      contenu: `La demande '${titre}' a été ajoutée`,
      dateEnvoie: new Date().toISOString().split('T')[0],
      conseille_id : conseille_id
    });

    res.json({ id: result.insertId, titre });
  });
});

// 🔄 Modifier une demande
app.put('/demandes/:id', async (req, res) => {
  const { titre, type, details, status, employe_id, conseille_id } = req.body;
  const { id } = req.params;

  const query = 'UPDATE demandes SET titre = ?, type = ?, details = ?, status = ?, employe_id = ?, conseille_id = ? WHERE id = ?';
  demandeDB.query(query, [titre, type, details, status, employe_id, conseille_id, id], async (err, result) => {
    if (err) return res.status(500).json(err);

    await sendNotificationEvent({
      idNotification: `notif_update_${id}`,
      titre: "Demande mise à jour",
      contenu: `La demande '${titre}' a été mise à jour`,
      dateEnvoie: new Date().toISOString().split('T')[0],
      conseille_id : conseille_id
    });

    res.json({ message: "Demande mise à jour" });
  });
});

// 📄 Obtenir toutes les demandes avec employé et conseille
app.get('/demandes', async (req, res) => {
  demandeDB.query('SELECT * FROM demandes', async (err, demandes) => {
    if (err) return res.status(500).json(err);

    const enriched = await Promise.all(demandes.map(async (demande) => {
      const [employe] = await employeDB.promise().query('SELECT * FROM employes WHERE id = ?', [demande.employe_id]);
      const [conseille] = await demandeDB.promise().query('SELECT * FROM conseille WHERE id = ?', [demande.conseille_id]);

      return {
        ...demande,
        employe: employe[0] || null,
        conseille: conseille[0] || null
      };
    }));

    res.json(enriched);
  });
});

// 🗑 Supprimer une demande
app.delete('/demandes/:id', (req, res) => {
  demandeDB.query('DELETE FROM demandes WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Demande supprimée" });
  });
});

// ➕ Ajouter un conseille
app.post('/conseilles', (req, res) => {
  const { nom, prenom } = req.body;
  demandeDB.query('INSERT INTO conseille (nom, prenom) VALUES (?, ?)', [nom, prenom], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, nom, prenom });
  });
});

// 📄 Obtenir tous les conseille
app.get('/conseilles', (req, res) => {
  demandeDB.query('SELECT * FROM conseille', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.listen(3002,'0.0.0.0', () => console.log('✅ Service Demande en écoute sur le port 3002'));
