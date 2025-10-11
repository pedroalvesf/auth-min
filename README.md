# 🔐 Auth-Min

Ultra-lightweight authentication microservice built with **DDD** + **Clean Architecture** and **native implementations**.

## ⚡ Features

- 🚀 **Ultra-performance**: 135MB RAM, HTTP native server
- 🔐 **JWT Authentication**: Native implementation (no dependencies)
- 👥 **Role-based Access**: USER, ADMIN, MODERATOR
- 📊 **Login History**: IP tracking and audit logs
- 🛡️ **Security**: Scrypt password hashing + timing-safe comparisons
- 🐳 **Ready for Production**: Docker + docker-compose included
- 📝 **Well Documented**: Comprehensive architecture guide

## 🏗️ Architecture

- **Domain Driven Design (DDD)**
- **Clean Architecture** 
- **Dependency Inversion**
- **Either Pattern** for error handling
- **Native implementations** (no heavy frameworks)

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
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/validate` | Validate JWT token |
| GET | `/health` | Health check |

## 📚 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation covering:
- Complete architecture overview
- API documentation with examples
- Security implementation details
- Database schema
- How to integrate with other projects

## 🛠️ Tech Stack

- **Runtime**: Node.js native HTTP server
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Native JWT implementation
- **Password**: Native Scrypt hashing
- **Container**: Docker

## 🎯 Production Dependencies

Only **3 production dependencies**:
- `@prisma/client` - Database ORM
- `prisma` - Database toolkit
- `dotenv` - Environment variables

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
