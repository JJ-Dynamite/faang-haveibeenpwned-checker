# Check if you have been hacked

[![CI](https://github.com/JJ-Dynamite/haveibeenpwnedchecker/actions/workflows/ci.yml/badge.svg)](https://github.com/JJ-Dynamite/haveibeenpwnedchecker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Check if you have been hacked - Production-ready full-stack application

## Tech Stack

- **Backend**: Rust with Axum framework
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **CI/CD**: GitHub Actions
- **Deployment**: Docker + Cloud

## Getting Started

### Prerequisites

- Rust 1.75+
- Node.js 20+
- pnpm or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/JJ-Dynamite/haveibeenpwnedchecker.git
cd haveibeenpwned-checker

# Install backend dependencies
cd backend
cargo build

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Start backend (port 3001)
cd backend
cargo run

# Start frontend (port 3000)
cd frontend
npm run dev
```

## API Documentation

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |

## Project Structure

```
haveibeenpwned-checker/
├── backend/           # Rust Axum API
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── Dockerfile
├── frontend/          # Next.js app
│   ├── src/
│   │   └── app/
│   ├── package.json
│   └── Dockerfile
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── docker-compose.yml
├── Makefile
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
