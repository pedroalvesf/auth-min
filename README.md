# 🔐 Auth-Min

Authentication service built with **NestJS** + **DDD** + **Clean Architecture** for scalable and maintainable systems.

## ⚡ Features

- 🚀 **NestJS Framework**: Enterprise-grade Node.js framework
- 🔐 **JWT Authentication**: Secure access & refresh token management
- 📱 **Device-based Auth**: Device tracking and management
- 🛡️ **Security**: Bcrypt password hashing + token validation
- 🔄 **Token Refresh**: Automatic access token renewal
- 🚫 **Token Revocation**: Device and user-level token management
- 📝 **Clean Architecture**: DDD principles with dependency injection

## 🏗️ Architecture

- **NestJS Framework** with modular design
- **Domain Driven Design (DDD)**
- **Clean Architecture** layers
- **Dependency Injection** with @Injectable decorators
- **Either Pattern** for error handling
- **Repository Pattern** for data access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd auth-min
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start with Docker
```bash
docker-compose up -d
```

### 4. Run Migrations
```bash
npm run prisma:migrate
```

### 5. Development
```bash
npm run dev
# Server running on http://localhost:3000
```

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/authenticate-device` | Device authentication |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/validate-token` | Validate JWT token |
| POST | `/auth/revoke-device` | Revoke specific device |
| POST | `/auth/revoke-all-devices` | Revoke all user devices |
| GET | `/health` | Health check |

## 📚 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation covering:
- Complete architecture overview
- API documentation with examples
- Security implementation details
- Database schema
- How to integrate with other projects

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Password**: Bcrypt hashing
- **DI**: NestJS dependency injection
- **Container**: Docker

## 🎯 Key Dependencies

- `@nestjs/common` - NestJS core framework
- `@nestjs/core` - NestJS application core
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token handling
- `reflect-metadata` - Decorator metadata

## 📈 Performance

- **Memory Usage**: ~135MB
- **Response Time**: <5ms average
- **Cold Start**: <100ms
- **Build Size**: Ultra-lightweight

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

_Built with ❤️ for ultra-performance services_
