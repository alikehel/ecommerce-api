# Naslook API

## Features

## Links

## Technology Stack

The backend API is built using the following technologies and modules:

-   Cloudflare Workers - JavaScript runtime environment.
-   Hono - Web framework for Cloudflare Workers.
-   TypeScript - Static typing for JavaScript.
-   SQLite - Relational database.
-   Drizzle ORM - ORM for database access and modeling.
-   Zod - Data validation.
-   Pino - Logging library.
-   Swagger - API documentation.
-   ESLint - Linter.
-   Prettier - Code formatter.

## Getting Started

To set up the development environment for the backend API, follow these steps:

### Installation Steps

1. Clone the repository from GitHub to your local machine:

```
git clone https://github.com/alikehel/ecommerce-api.git
```

2. Navigate into the project directory:

```
cd ecommerce-api
```

3. Install dependencies:

```
pnpm install
```

4. Rename `.dev.vars.example` to `.dev.vars.exale` and update the environment variables to match your local setup:

```
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_API_TOKEN=
```

5. Start the application:

```
pnpm run dev
```

9. The API should now be running on `http://localhost:8787` or the port defined in code.

10. Test API endpoints.

## Development Roadmap

The project is currently under development, and the following tasks are being worked on:

-   [ ]

## Contributing

### Non-substantive changes

For any minor updates to the curriculum, such as fixing broken URLs, correcting spelling or syntax errors, and other non-substantive issues, we welcome you to submit a pull request. You can do this by following the guidelines in [pull request guide](https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3/).

### Substantive changes

If you have specific and substantial feedback or concerns about the content, we encourage you to open an issue. Please refer to [open an issue](https://help.github.com/articles/creating-an-issue/) for assistance.

## License

This project is licensed under the [MIT License](LICENSE).
