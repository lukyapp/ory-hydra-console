# Ory Hydra Console

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

A modern, user-friendly administration console for managing Ory Hydra OAuth 2.0 and OpenID Connect server. This project provides a responsive web interface for administrators to manage OAuth clients.

## 🚀 Features

- **OAuth 2.0 & OpenID Connect Management**
  - Create, view, update, and delete OAuth clients
  - Manage client credentials and permissions
  - Monitor active sessions and tokens

- **Modern Tech Stack**
  - Built with Next.js and React 18+
  - TypeScript for type safety
  - Prisma ORM for database operations
  - Tailwind CSS for styling

## 🛠 Tech Stack

- **Frontend**: Next.js, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **ORM**: Prisma
- **Containerization**: Docker

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm
- Docker (for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ory-hydra-console.git
   cd ory-hydra-console
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   # Start PostgreSQL with Docker
   pnpm dev:postgres

   # Run database migrations
   pnpm prisma:init

   # Seed initial data (if available)
   pnpm prisma:seed
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
ory-hydra-console/
├── prisma/           # Database schema and migrations
├── public/           # Static files
├── src/
│   ├── app/          # Next.js 13+ app directory
│   ├── app-utils/    # Utility functions
│   ├── components/   # Reusable UI components
│   ├── features/     # Feature-based modules
│   ├── lib/          # Shared libraries
│   └── types/        # TypeScript type definitions
├── .env.example      # Example environment variables
└── package.json      # Project dependencies and scripts
```

## 📝 API Endpoints

- `GET /api/oauth-clients` - List all OAuth clients
- `POST /api/oauth-clients` - Create a new OAuth client
- `GET /api/oauth-clients/[clientId]` - Get a specific OAuth client
- `PATCH /api/oauth-clients/[clientId]` - Update an OAuth client
- `DELETE /api/oauth-clients/[clientId]` - Delete an OAuth client
