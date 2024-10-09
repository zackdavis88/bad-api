# Bad API

One day this will be a project ticketing system that is severly lacking in features when compared to other similiar products.

## Required Dependencies

These are the dependencies that I am running the app with locally, different versions _may_ work but these are confirmed to work:

[NodeJS v20.18.0](https://nodejs.org/en/download/package-manager)

[Postgres 14.13](https://www.postgresql.org/download/)

## Setup

### Install pnpm

The preferred way to run this API is via [pnpm](https://pnpm.io/) which can be installed with:

```bash
npm install -g pnpm
```

### Install node_modules

```bash
pnpm install
```

### Create auth config

Create a file named `auth.ts` located under `src/config/` with the following variables:

```typescript
// src/config/auth.ts
export const SECRET = 'SUPER_DUPER_SECRET'; // This can be any string you want, do not make it SUPER_DUPER_SECRET lol
export const SALT_ROUNDS = 10; // This can be any number you want.
```

### Create db config

Create a file named `db.ts` located under `src/config/` with the following variables:

```typescript
// src/config/db.ts
export const DB_USERNAME = 'YOUR_DB_USERNAME_GOES_HERE';
export const DB_PASSWORD = 'YOUR_DB_PASSWORD_GOES_HERE';
export const DB_HOSTNAME = 'YOUR_DB_HOSTNAME_GOES_HERE';
export const DB_PORT = 'YOUR_DB_PORT_GOES_HERE';
export const DB_NAME = 'YOUR_DB_NAME_GOES_HERE';
```

## Start Up

For local development you can run

```bash
pnpm start:dev
```

For prod you can run

```bash
pnpm build
pnpm start:prod
```

## Test Suite

The API comes with a set of integration tests that run everytime you make a PR on github, PRs cannot be merged
if the test suite has any failures.

To run the test suite locally you must start the API in a terminal and then in a separate terminal run:

```bash
pnpm test
```
