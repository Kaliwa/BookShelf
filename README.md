# BookShelf API

API NestJS pour gerer des utilisateurs/authentification et une bibliotheque de livres.

## Prerequis

- Node.js 20+
- pnpm
- Docker

## Installation

```bash
pnpm install
```

## Base de donnees (PostgreSQL avec Docker)

La base locale est fournie via Docker Compose.

```bash
docker compose up -d
```

Variable d'environnement utilisee:

```env
DATABASE_URL="postgresql://bookshelf:bookshelf@localhost:5432/bookshelf?schema=public"
```

## Prisma: migration + seed

Appliquer les migrations:

```bash
pnpm prisma migrate dev --name init_postgres
```

Executer les seeds:

```bash
pnpm prisma db seed
```

Le seed cree plusieurs utilisateurs et un jeu de livres deja rempli.

## Lancer l'application

```bash
pnpm run start:dev
```

## Tests

```bash
pnpm run test
pnpm run test:e2e
```

## Arreter la base Docker

```bash
docker compose down
```
