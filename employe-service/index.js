const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: 'mysql-employe', // ou 'localhost' avec port: 3307 si en local
  user: 'root',
  password: 'root',
  database: 'employe_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// 1. Création d'un employé (POST)
app.post('/employes', (req, res) => {
  const { nom, prenom, grade } = req.body;
  db.query(
    'INSERT INTO employes (nom, prenom, grade) VALUES (?, ?, ?)',
    [nom, prenom, grade],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de l\'insertion', error: err });
      res.status(201).json({ id: result.insertId, nom, prenom, grade });
    }
  );
});

// 2. Récupérer tous les employés (GET)
app.get('/employes', (req, res) => {
  db.query('SELECT * FROM employes', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la récupération', error: err });
    res.status(200).json(results);
  });
});

// 3. Récupérer un employé par ID (GET)
app.get('/employes/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM employes WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la récupération', error: err });
    if (!result.length) return res.status(404).json({ message: 'Employé non trouvé' });
    res.status(200).json(result[0]);
  });
});

// 4. Mise à jour d'un employé (PUT)
app.put('/employes/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prenom, grade } = req.body;
  db.query(
    'UPDATE employes SET nom = ?, prenom = ?, grade = ? WHERE id = ?',
    [nom, prenom, grade, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Employé non trouvé' });
      res.status(200).json({ message: 'Employé mis à jour', id, nom, prenom, grade });
    }
  );
});

// 5. Suppression d'un employé (DELETE)
app.delete('/employes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM employes WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Employé non trouvé' });
    res.status(200).json({ message: 'Employé supprimé', id });
  });
});


// Ajouter un bénéficiaire
app.post('/beneficiaires', (req, res) => {
    const { nom, prenom, dateDesignation, employe_id } = req.body;
    db.query(
      'INSERT INTO beneficiaires (nom, prenom, dateDesignation, employe_id) VALUES (?, ?, ?, ?)',
      [nom, prenom, dateDesignation, employe_id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de l\'ajout', error: err });
        res.status(201).json({ id: result.insertId, nom, prenom, dateDesignation, employe_id });
      }
    );
  });
  
  // -------------------------- READ --------------------------
  
  // Récupérer tous les employés
  app.get('/employes', (req, res) => {
    db.query('SELECT * FROM employes', (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des employés', error: err });
      res.status(200).json(results);
    });
  });
  
  // Récupérer tous les bénéficiaires avec leurs informations d'employés
  app.get('/beneficiaires', (req, res) => {
    db.query(
      `SELECT beneficiaires.id, beneficiaires.nom AS beneficiaire_nom, beneficiaires.prenom AS beneficiaire_prenom, 
              beneficiaires.dateDesignation, 
              employes.nom AS employe_nom, employes.prenom AS employe_prenom, employes.grade
       FROM beneficiaires
       JOIN employes ON beneficiaires.employe_id = employes.id`,
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des bénéficiaires', error: err });
        res.status(200).json(results);
      }
    );
  });
  
  // -------------------------- UPDATE --------------------------
  
  // Mettre à jour un employé
  app.put('/employes/:id', (req, res) => {
    const { id } = req.params;
    const { nom, prenom, grade } = req.body;
    db.query(
      'UPDATE employes SET nom = ?, prenom = ?, grade = ? WHERE id = ?',
      [nom, prenom, grade, id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Employé non trouvé' });
        res.status(200).json({ message: 'Employé mis à jour avec succès' });
      }
    );
  });
  
  // Mettre à jour un bénéficiaire
  app.put('/beneficiaires/:id', (req, res) => {
    const { id } = req.params;
    const { nom, prenom, dateDesignation, employe_id } = req.body;
    db.query(
      'UPDATE beneficiaires SET nom = ?, prenom = ?, dateDesignation = ?, employe_id = ? WHERE id = ?',
      [nom, prenom, dateDesignation, employe_id, id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
        res.status(200).json({ message: 'Bénéficiaire mis à jour avec succès' });
      }
    );
  });
  
  // -------------------------- DELETE --------------------------
  
  // Supprimer un employé
  app.delete('/employes/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employes WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Employé non trouvé' });
      res.status(200).json({ message: 'Employé supprimé avec succès' });
    });
  });
  
  // Supprimer un bénéficiaire
  app.delete('/beneficiaires/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM beneficiaires WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
      res.status(200).json({ message: 'Bénéficiaire supprimé avec succès' });
    });
  });
  
// Lancer l'application sur le port 3001
app.listen(3001, '0.0.0.0', () => console.log('Employe service on port 3001'));
