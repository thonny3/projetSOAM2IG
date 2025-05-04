# 🎯 Microservices App – Projet SOA M2IG

Ce projet est une application simple basée sur l’architecture **microservices**, développée avec **Node.js**, **Kafka**, **Docker**, **MySQL** et expose des **API RESTful**. Chaque service est isolé et communique via des messages Kafka.

---

## 🚀 Modules et technologies utilisées

### 🐳 Docker Desktop
Utilisé pour **conteneriser chaque service** du projet (Express.js, MySQL, Kafka). Docker permet de lancer tous les services en parallèle via `docker-compose`.

### 📦 Dockerfile
Chaque microservice possède un **Dockerfile** qui définit son environnement d'exécution (Node.js, dépendances, ports exposés, etc.).

### 📨 Apache Kafka
Kafka est utilisé comme **bus de messages** pour permettre la communication **asynchrone** entre les microservices (ex : un service envoie un événement qu’un autre écoute).

### ⚙️ Express.js
Framework **Node.js** minimaliste pour construire les **API REST** de chaque microservice. Il gère les routes, les middlewares et les réponses HTTP.

### 🛢️ MySQL
Chaque microservice peut avoir sa **propre base de données MySQL** pour stocker ses données, selon le principe de **base de données par service**.

### 🌐 RESTful API
L’application expose des **API RESTful** bien structurées (GET, POST, PUT, DELETE) permettant aux clients de consommer les services de manière standard.

---
