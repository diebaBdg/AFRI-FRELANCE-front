# AfriFreelance Frontend

La marketplace premium qui connecte les meilleurs talents africains aux opportunités locales et internationales.

## Prérequis

1. Clonez le dépôt.
2. Installez les dépendances : `npm install`.

## Lancer le frontend

```bash
npm run dev
```

Ouvrez l'URL locale affichée par Vite.

## Configuration

Le frontend communique avec le backend Spring Boot via `/api/v1` (proxy Vite vers `http://localhost:8082`).

Variables d'environnement (`.env.local`) :

```
VITE_API_BASE_URL=http://localhost:8082/api/v1
```

Par défaut, le proxy Vite redirige `/api` vers `http://localhost:8082`.

## Scripts

- `npm run dev` — serveur de développement Vite
- `npm run build` — build de production
- `npm run lint` — vérification ESLint
- `npm run typecheck` — vérification des types

## Docs & Support

Documentation API (Swagger) : disponible sur le backend Spring Boot à `/api/v1/swagger-ui.html`
