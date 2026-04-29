# BookShelf

Application NestJS unique: API + frontend statique (login, register, books, bookshelf).

## Prerequis

- Docker + Docker Compose
- Node.js 20+ et pnpm (optionnels, pour lancer hors Docker)

## Demarrage Rapide (Nouvel Ordinateur)

```bash
make first_launch
```

`make first_launch` fait tout en une seule commande:

- cree `.env` depuis `.env.example` si besoin
- build et demarre les conteneurs Docker
- execute le seed Prisma dans le conteneur `app`

## Premiere execution

1. Cloner le projet puis se placer dans le dossier.
2. Lancer la commande d'onboarding:

```bash
make first_launch
```

3. Ouvrir l'application:
   - App: http://localhost:3000
   - MailHog: http://localhost:8025
4. Se connecter avec un compte seed (ci-dessous), puis recuperer le code 2FA dans MailHog.

## Commandes Make

```bash
make first_launch  # setup complet pour un nouveau developpeur
make up            # build + demarrage des conteneurs
make seed          # lance le seed Prisma dans le conteneur app
make down          # arrete la stack Docker
```

Puis ouvrir:

- App: http://localhost:3000
- MailHog: http://localhost:8025

Comptes seed:

- admin@test.com / admin123
- alice@test.com / 123456
- bob@test.com / 123456
- charlie@test.com / 123456

Note: le login utilise un code 2FA recu par email. En local, recupere ce code dans MailHog.

## Installation sans le first_launch

```bash
pnpm install
```

## Configuration

```bash
cp .env.example .env
```

Verifier au minimum:

```env
DATABASE_URL="postgresql://bookshelf:bookshelf@localhost:5432/bookshelf?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION_SECONDS="86400"
MAIL_HOST="mailhog"
MAIL_PORT="1025"
MAIL_SECURE="false"
MAIL_USER=""
MAIL_PASS=""
MAIL_FROM="no-reply@bookshelf.local"
```

Pour le mode Docker (`pnpm start:oneshot`), le service `app` lit aussi ce meme fichier `.env`.
Dans ce cas, utiliser:

```env
DATABASE_URL="postgresql://bookshelf:bookshelf@postgres:5432/bookshelf?schema=public"
MAIL_HOST="mailhog"
```

## Base de donnees

Demarrer PostgreSQL et MailHog (si Docker):

```bash
make up
```

Appliquer les migrations et generer Prisma Client:

```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

Seed (optionnel):

```bash
pnpm prisma db seed
```

Avec Docker:

```bash
make seed
```

## Lancer l'application

```bash
pnpm start:dev
```

Ou en one-shot Docker (build et lance app + PostgreSQL + MailHog):

```bash
pnpm start:oneshot
```

Cette commande lance toute la stack Docker (app + PostgreSQL + MailHog).

One-shot avec seed Docker:

```bash
pnpm start:oneshot:seed
```

Comptes seed:

- admin@test.com / admin123
- alice@test.com / 123456
- bob@test.com / 123456
- charlie@test.com / 123456

Application: http://localhost:3000

Pages frontend:

- /
- /login
- /register
- /books
- /bookshelf

Swagger API:

- /api/docs

MailHog:

- Interface web: http://localhost:8025
- SMTP local: `localhost:1025`

## Email et 2FA

- La verification d'email et le code 2FA sont envoyes via SMTP.
- Le `docker compose up -d` du projet demarre aussi MailHog pour capter les emails en local.
- Configurer `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS` et `MAIL_FROM` dans `.env`.
- Avec MailHog en Docker Compose, utiliser `MAIL_HOST=mailhog`, `MAIL_PORT=1025`, `MAIL_SECURE=false` et laisser `MAIL_USER` / `MAIL_PASS` vides.
- Si l'envoi du mail de verification echoue pendant l'inscription, l'utilisateur n'est pas conserve.
- Si l'envoi du mail 2FA echoue pendant la connexion, le code 2FA genere est annule.
- Flux actuel: register -> reception du code par email -> verify-email -> login -> reception du code 2FA par email -> verify-2fa -> token JWT.

## Endpoints API (prefixe /api)

- POST /api/auth/register
- POST /api/auth/verify-email
- POST /api/auth/login
- POST /api/auth/verify-2fa
- GET /api/books
- GET /api/books?bookshelfId=ID
- GET /api/books?search=terme
- GET /api/books?bookshelfId=ID&search=terme
- GET /api/books/all
- GET /api/books/all?search=terme
- POST /api/books
- PATCH /api/books/:id
- DELETE /api/books/:id
- GET /api/bookshelf
- GET /api/bookshelf?search=terme
- GET /api/bookshelf/all
- GET /api/bookshelf/all?search=terme
- GET /api/bookshelf/:id
- POST /api/bookshelf
- PATCH /api/bookshelf/:id
- DELETE /api/bookshelf/:id

Regles d'acces:

- Un utilisateur standard accede uniquement a ses livres et ses bookshelves.
- Un admin peut consulter, modifier et supprimer les livres et bookshelves de tous les utilisateurs.

## Tests

```bash
pnpm test
pnpm test:e2e
```
