# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## Instructions pour lancer l'application HU Management System

### 📋 Prérequis
- Node.js installé (version 14 ou supérieure)
- Deux fenêtres de terminal/commande

### 🔧 Installation initiale (à faire une seule fois)

#### Terminal 1 - Backend Server:
```bash
cd E:\GeniePot\aiprojects\huapp\server
npm install
```

#### Terminal 2 - Frontend React:
```bash
cd E:\GeniePot\aiprojects\huapp
npm install
```

### ▶️ Démarrage de l'application

#### Étape 1 - Démarrer le serveur backend (Terminal 1):
```bash
cd E:\GeniePot\aiprojects\huapp\server
node index.js
```
Vous devriez voir:
```
🚀 Server is running on port 5000
📡 API available at http://localhost:5000/api
```

#### Étape 2 - Démarrer l'application React (Terminal 2):
```bash
cd E:\GeniePot\aiprojects\huapp
npm start
```
L'application s'ouvrira automatiquement dans votre navigateur à http://localhost:3000

### 👤 Connexion

**Compte Administrateur par défaut:**
- Email: `admin@fpo.ma`
- Mot de passe: `admin123`

**Ou créez un nouveau compte** en cliquant sur "S'inscrire"

### ✅ Fonctionnalités principales disponibles:

1. **Gestion des Candidats** ✅
   - Ajouter un nouveau candidat
   - Modifier les informations
   - Supprimer un candidat
   - Voir les détails complets

2. **Gestion des Candidatures** ✅
   - Créer une nouvelle candidature
   - Mettre à jour le statut
   - Suivre la progression
   - Supprimer une candidature

3. **Tableau de bord** ✅
   - Statistiques en temps réel
   - Graphiques de suivi
   - Vue d'ensemble du système

4. **Authentification** ✅
   - Connexion sécurisée
   - Inscription de nouveaux utilisateurs
   - Gestion de session

### 🗂️ Base de données

La base de données SQLite est créée automatiquement au premier démarrage dans:
`E:\GeniePot\aiprojects\huapp\server\hu_database.db`

### ⚠️ Dépannage

**Si le serveur ne démarre pas:**
1. Vérifiez que le port 5000 n'est pas utilisé
2. Supprimez node_modules et réinstallez: `npm install`

**Si l'application React ne démarre pas:**
1. Vérifiez que le port 3000 n'est pas utilisé
2. Supprimez node_modules et réinstallez: `npm install`

**Erreur de connexion à la base de données:**
- Le serveur backend doit être démarré AVANT d'utiliser l'application

### 📝 Notes importantes

- Les données sont stockées localement dans SQLite
- Les fichiers uploadés sont stockés dans `server/uploads/`
- L'application fonctionne en mode développement

### 🎯 Utilisation recommandée

1. **Commencez par ajouter des candidats** dans la section "Candidats"
2. **Créez des candidatures** pour ces candidats dans "Candidatures"
3. **Suivez les statistiques** sur le tableau de bord

### 💡 Conseils

- Utilisez Chrome ou Firefox pour une meilleure expérience
- La base de données contient déjà quelques exemples de données
- Toutes les opérations CRUD sont fonctionnelles

---

**Support:** En cas de problème, vérifiez que les deux serveurs (backend et frontend) sont bien démarrés et consultez les messages d'erreur dans les consoles.
