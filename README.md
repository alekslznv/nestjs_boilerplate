# NestJS Boilerplate

A production-ready REST API boilerplate built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: NestJS 11
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: PostgreSQL 17
- **ORM**: Prisma 7
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
│   ├── dto/                       # Shared DTOs (BaseResponseDto)
│   ├── filters/                   # Global exception filter
│   │   └── handlers/              # Prisma error handlers (P2002, P2025)
│   └── interfaces/                # Shared interfaces
└── modules/
    ├── prisma/                    # Database connection module
    └── users/                     # Users CRUD module
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

| Method   | Endpoint      | Description    | Status |
|----------|---------------|----------------|--------|
| `GET`    | `/users`      | List all users | 200    |
| `GET`    | `/users/:id`  | Get user by ID | 200    |
| `POST`   | `/users`      | Create a user  | 201    |
| `PATCH`  | `/users/:id`  | Update a user  | 200    |
| `DELETE` | `/users/:id`  | Delete a user  | 204    |

### Error Handling

| Prisma Error | HTTP Response       |
|--------------|---------------------|
| P2002        | 409 Conflict        |
| P2025        | 404 Not Found       |
| Other        | 500 Internal Server |

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

Edit `.env` with your database credentials:

```ini
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin
DATABASE_NAME=nestjs_boilerplate
```

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
