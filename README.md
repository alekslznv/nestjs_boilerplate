# NestJS Boilerplate

A production-ready REST API boilerplate built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: NestJS 11
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: PostgreSQL 17
- **ORM**: Prisma 7
- **Auth**: JWT (access + refresh tokens), Passport, argon2
- **Validation**: class-validator + class-transformer
- **Testing**: Jest 30
- **Linting**: ESLint 9 (flat config) + Prettier
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions

## Project Structure

```text
src/
├── main.ts                        # App bootstrap, global pipes & versioning
├── app.module.ts                  # Root module
├── common/
│   ├── decorators/                # @CurrentUser() parameter decorator
│   ├── dto/                       # Shared DTOs (BaseResponseDto)
│   ├── filters/                   # Global exception filter
│   │   └── handlers/              # Prisma error handlers (P2002, P2025)
│   ├── interfaces/                # Shared interfaces
│   └── types/                     # Branded types (Argon2Hash)
└── modules/
    ├── auth/                      # Authentication module
    │   ├── dto/                   # TokenPairDto, UpdateTokensDto
    │   ├── guards/                # JwtAuthGuard
    │   ├── providers/             # Separate JWT providers (access + refresh)
    │   ├── strategies/            # LocalStrategy, JwtStrategy
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.service.spec.ts
    ├── prisma/                    # Database connection module
    └── users/                     # Users CRUD module (JWT-protected)
        ├── dto/                   # Create, Update, Response DTOs
        ├── users.controller.ts
        ├── users.service.ts
        └── users.controller.spec.ts
prisma/
├── schema.prisma                  # Database schema
├── migrations/                    # Version-controlled migrations
├── seeds/                         # Seed data
└── client.ts                      # Prisma client factory
```

## API Endpoints

All endpoints are versioned under `/v1`.

### Auth (public)

| Method | Endpoint         | Description             | Status |
|--------|------------------|-------------------------|--------|
| `POST` | `/auth/signup`   | Register a new user     | 201    |
| `POST` | `/auth/signin`   | Login, returns tokens   | 200    |
| `POST` | `/auth/refresh`  | Refresh token pair      | 200    |
| `POST` | `/auth/logout`   | Invalidate refresh token| 204    |

`/auth/logout` requires a valid JWT. All other auth routes are public.

### Users (JWT-protected)

| Method   | Endpoint      | Description    | Status |
|----------|---------------|----------------|--------|
| `GET`    | `/users`      | List all users | 200    |
| `GET`    | `/users/:id`  | Get user by ID | 200    |
| `PATCH`  | `/users/:id`  | Update a user  | 200    |
| `DELETE` | `/users/:id`  | Delete a user  | 204    |

All `/users` endpoints require `Authorization: Bearer <accessToken>` header.

### Error Handling

| Prisma Error | HTTP Response       |
|--------------|---------------------|
| P2002        | 409 Conflict        |
| P2025        | 404 Not Found       |
| Other        | 500 Internal Server |

### Authentication Flow

1. **Sign up** — `POST /auth/signup` with `{ email, name, password, role }`. Password is hashed with argon2.
2. **Sign in** — `POST /auth/signin` with `{ email, password }`. Returns `{ accessToken, refreshToken }`.
3. **Access protected routes** — pass `Authorization: Bearer <accessToken>` header. Access tokens expire in 15 minutes.
4. **Refresh tokens** — `POST /auth/refresh` with `{ refreshToken }`. Returns a new token pair. Refresh tokens expire in 7 days.
5. **Logout** — `POST /auth/logout` with a valid JWT. Invalidates the refresh token.

Refresh tokens are hashed with argon2 and stored in the database. Access and refresh tokens use separate JWT secrets.

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL 17 (or Docker)

### Local Setup

1. **Clone and install dependencies**

```bash
git clone <repo-url>
cd nestjs_boilerplate
pnpm install
```

1. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secrets:

```ini
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin
DATABASE_NAME=nestjs_boilerplate

JWT_SECRET=<your-256-bit-secret>
JWT_REFRESH_SECRET=<your-256-bit-secret>
```

Generate secure secrets with: `openssl rand -hex 64`

1. **Run migrations and seed**

```bash
pnpm prisma migrate deploy --config prisma.config.ts
pnpm prisma db seed --config prisma.config.ts
```

1. **Generate Prisma client**

```bash
pnpm prisma generate --config prisma.config.ts
```

1. **Start the server**

```bash
pnpm start:dev
```

The API will be available at `http://localhost:3000/v1`.

### Docker Setup

Start the entire stack (app + PostgreSQL) with Docker Compose:

```bash
docker compose up --build
```

This will:

- Start a PostgreSQL 17 instance on port 5432
- Build and start the NestJS app on port 3000

## Scripts

| Script            | Description                       |
|-------------------|-----------------------------------|
| `pnpm start:dev`  | Start in watch mode (development) |
| `pnpm start:debug`| Start with debugger               |
| `pnpm start:prod` | Start compiled production build   |
| `pnpm build`      | Compile TypeScript                |
| `pnpm test`       | Run unit tests                    |
| `pnpm test:watch` | Run tests in watch mode           |
| `pnpm test:cov`   | Generate test coverage report     |
| `pnpm lint`       | Fix linting issues                |
| `pnpm lint:check` | Check linting without fixing      |
| `pnpm format`     | Format code with Prettier         |

## CI/CD

GitHub Actions runs on every push:

- **Lint** - checks code style with ESLint
- **Test** - runs unit tests with Jest

## License

[MIT](LICENSE)
