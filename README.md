# Boilerplate Express/Node.js

Ce projet est un boilerplate Express/Node.js moderne créé pour servir comme base pour des applications back-end en milieu professionnel. Il intègre les meilleures pratiques et technologies actuelles pour le développement back-end en 2024.

## Technologies utilisées

- **Express** : Framework web rapide et minimaliste pour Node.js
- **TypeScript** : Superset typé de JavaScript pour une meilleure maintenabilité
- **Prisma** : ORM moderne pour Node.js et TypeScript
- **PostgreSQL** : Système de gestion de base de données relationnelle
- **Passport.js** : Middleware d'authentification pour Node.js
- **JWT** : JSON Web Tokens pour la gestion des sessions
- **Express Validator** : Middleware de validation des données
- **Winston** : Logger flexible pour Node.js
- **Jest & Supertest** : Outils pour les tests unitaires et d'intégration
- **ESLint & Prettier** : Outils pour maintenir un code propre et cohérent
- **Husky & lint-staged** : Outils pour exécuter des scripts avant les commits
- **Helmet** : Middleware de sécurité pour Express
- **CORS** : Middleware pour la gestion du Cross-Origin Resource Sharing
- **Swagger** : Documentation automatique de l'API

## Fonctionnalités

- Structure de projet claire et modulaire
- Authentification complète (locale et Google OAuth)
- Validation robuste des données entrantes
- Gestion globale des erreurs
- Système de logging avancé
- Tests unitaires et d'intégration
- Linting et formatting automatiques
- Hooks de pré-commit
- Documentation API intégrée
- Support multi-environnement
- Sécurité renforcée

## Comment utiliser ce boilerplate

1. Clonez ce repository
2. Installez les dépendances avec `npm install`
3. Configurez vos variables d'environnement (voir section Configuration)
4. Créez votre base de données PostgreSQL
5. Lancez les migrations Prisma avec `npm run db:migrate`
6. Lancez le serveur de développement avec `npm run dev`

## Configuration des Variables d'Environnement

Le projet utilise trois fichiers d'environnement différents :

1. `.env` : Variables d'environnement de développement

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/my_app_dev"
   JWT_SECRET="your-jwt-secret"
   PORT=3000
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ALLOWED_ORIGINS="http://localhost:3000"
   ```

2. `.env.test` : Variables d'environnement pour les tests

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/my_app_test"
   JWT_SECRET="test-jwt-secret"
   PORT=3001
   GOOGLE_CLIENT_ID="test-google-client-id"
   GOOGLE_CLIENT_SECRET="test-google-client-secret"
   ALLOWED_ORIGINS="http://localhost:3000"
   ```

3. `.env.test.example` : Template pour le fichier de test
   - Sert d'exemple pour configurer l'environnement de test
   - Ne contient pas de valeurs sensibles
   - Doit être versionné dans Git

⚠️ **Note importante** :

- `.env` et `.env.test` ne doivent jamais être versionnés (inclus dans `.gitignore`)
- Seul `.env.test.example` doit être versionné
- Copiez `.env.test.example` vers `.env.test` et ajustez les valeurs pour votre environnement local

## Scripts disponibles

### Scripts Principaux

- `npm start` : Lance le serveur en production
- `npm run start:prod` : Build et lance en production
- `npm run build` : Compilation TypeScript
- `npm run build:clean` : Nettoie le dossier dist et recompile
- `npm run clean` : Supprime le dossier dist
- `npm run dev` : Lance le serveur de développement
- `npm run dev:debug` : Lance le serveur en mode debug
- `npm run dev:full` : Lance le serveur et Prisma Studio simultanément

### Scripts Base de données

- `npm run db:migrate` : Lance les migrations Prisma
- `npm run db:push` : Pousse le schéma sans migration
- `npm run db:reset` : Réinitialise la base de données
- `npm run db:seed` : Remplit la DB avec des données initiales
- `npm run db:generate` : Génère le client Prisma
- `npm run studio` : Lance Prisma Studio

### Scripts de test et validation

- `npm test` : Lance les tests avec Jest
- `npm run test:watch` : Lance les tests en mode watch
- `npm run test:coverage` : Lance les tests avec couverture
- `npm run test:ci` : Lance les tests pour CI
- `npm run lint` : Vérifie le code avec ESLint
- `npm run lint:fix` : Corrige les erreurs de linting
- `npm run format` : Formate le code avec Prettier
- `npm run check-types` : Vérifie les types TypeScript
- `npm run validate` : Lance lint et check-types
- `npm run prepare` : Installe Husky
- `npm run precommit` : Lance lint-staged et les tests

## Base de Données

### Configuration Prisma

Le projet utilise Prisma comme ORM avec PostgreSQL. Voici le schéma de base :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String?
  name          String?
  googleId      String?   @unique
  accessToken   String?
  refreshToken  String?
  tokenExpiry   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Fonctionnalités du Modèle User

Le modèle User prend en charge :

- Authentification locale (email/mot de passe)
- Authentification Google OAuth
- Gestion des tokens (access et refresh)
- Horodatage automatique (création et mise à jour)

## Structure du projet

```
node-express-boilerplate/
├── .husky/
├── coverage/
├── logs/
├── prisma/
├── src/
│   ├── __tests__/
│   │   ├── config/
│   │   ├── routes/
│   │   └── utils/
│   ├── config/
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   ├── logger.ts
│   │   └── env.ts
│   ├── docs/
│   │   └── swagger.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── error.ts
│   │   ├── morgan.ts
│   │   └── validate.ts
│   ├── routes/
│   │   ├── auth.ts
│   ├── types/
│   │   ├── auth/
│   │   └── error/
│   │   └── express/
│   └── utils/
│   │     └── AppError.ts
│   ├── app/ts
│   └── db.ts
├── .env
├── .env.test
├── .env.test.example
├── .eslintrc.js
├── .gitignore
├── .lintstagedrc
├── .prettierrc
├── jest.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Tests

Le projet utilise Jest pour les tests unitaires et d'intégration. Les tests sont organisés dans le dossier `__tests__` et suivent la même structure que le code source.

### ⚠️ Important : Base de données de test

Les tests, particulièrement dans `__tests__/routes/auth.test.ts`, nettoient automatiquement la base de données de test. Il est donc **crucial** de :

1. Utiliser une base de données séparée pour les tests
2. Ne JAMAIS utiliser la même base de données que celle de développement ou production
3. S'assurer que la variable `DATABASE_URL` dans `.env.test` pointe vers une base de données dédiée aux tests

### Exemple de configuration sécurisée

```env
# .env (développement)
DATABASE_URL="postgresql://user:password@localhost:5432/my_app_dev"

# .env.test (tests)
DATABASE_URL="postgresql://user:password@localhost:5432/my_app_test"
```

## Sécurité

Le projet inclut plusieurs mesures de sécurité :

- Protection des en-têtes HTTP avec Helmet
- Configuration CORS
- Validation des données entrantes
- Authentification JWT
- Gestion sécurisée des mots de passe
- Variables d'environnement pour les données sensibles

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence ISC.
