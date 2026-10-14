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

Le frontend communique avec le backend Spring Boot via `/api/v1`.
En développement, Vite proxifie `/api` vers `http://localhost:8082` (port du backend, `SERVER_PORT`).

Laissez `VITE_API_BASE_URL` vide (défaut `/api/v1`) pour passer par le proxy. Pour appeler le backend directement :

```
VITE_API_BASE_URL=http://localhost:8082/api/v1
```

## Scripts

- `npm run dev` — serveur de développement Vite
- `npm run build` — build de production
- `npm run lint` — vérification ESLint
- `npm run typecheck` — vérification des types

## Docs & Support

Documentation API (Swagger) : `http://localhost:8082/api/v1/swagger-ui.html`
