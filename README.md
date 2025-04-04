# Ninio Kindergarten Application

A modern web application for kindergarten management, featuring parent and admin dashboards, interactive Three.js backgrounds, and comprehensive analytics.

![Ninio Application](https://via.placeholder.com/800x400?text=Ninio+Kindergarten+Application)

## Features

- **Interactive Three.js Background**: Engaging ABC blocks visualization with animation
- **Parent Dashboard**: Activity tracking, payment management, and child progress reports
- **Admin Dashboard**: Comprehensive management tools for kindergarten administrators
- **Payment System**: Secure payment processing with history and receipt generation
- **User Authentication**: Secure login and role-based access control
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Analytics**: Comprehensive tracking and reporting of user activities
- **Internationalization**: Multi-language support for global accessibility
- **Automated Testing**: Comprehensive test suite for reliability
- **CI/CD Pipeline**: Automated build, test, and deployment process

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account for backend services
- Groq API key for AI assistant features

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ninio-application.git
cd ninio-application

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start the development server
npm run dev
```

### Environment Configuration

The application requires several environment variables to be set. Copy the `.env.example` file to `.env.local` and update the values:

```bash
# Required Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key

# Optional Configuration
VITE_BASE_PATH=/
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_AI_ASSISTANT=false
```

See `.env.example` for a complete list of available configuration options.

### Security Configuration

The application includes comprehensive security features:

- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS attacks
- **HTTPS Enforcement**: Redirects HTTP requests to HTTPS in production
- **Secure Headers**: Implements best practices for HTTP security headers
- **Input Validation**: Validates all user inputs to prevent injection attacks

In development, security headers are applied automatically. In production, they are configured in the nginx.conf file.

## Building and Testing

### Building the Application

The application includes a robust build process with environment validation:

```bash
# Standard build with environment validation
npm run build

# Build without environment validation
npm run build-no-validate

# Build with bundle analysis
npm run analyze

# Generate bundle analysis report
npm run analyze:report
```

### Testing

The application includes comprehensive testing setup:

#### Unit and Component Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

#### End-to-End Tests

```bash
# Open Cypress test runner
npm run cypress

# Run Cypress tests headlessly
npm run cypress:run

# Run component tests
npm run cypress:component
```

### Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Type check with TypeScript
npm run type-check
```

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline**: Runs on every pull request to main and develop branches
  - Linting and type checking
  - Environment validation
  - Unit tests with coverage reporting
  - E2E tests
  - Build verification
  - Bundle size analysis

- **CD Pipeline**: Runs on push to main branch
  - Security audit
  - Automated deployment to staging environment
  - Smoke tests
  - Automated deployment to production environment

## Analytics

The application includes a comprehensive analytics system that tracks:

- Page views
- Feature usage
- User engagement
- Activity completion
- Session data

Analytics data is stored in Supabase and can be viewed in the admin dashboard.

## Deployment

### Docker

The application can be run in a Docker container:

```bash
# Build the Docker image
docker build -t ninio-app .

# Run the container
docker run -p 8080:80 ninio-app
```

Alternatively, use Docker Compose:

```bash
docker-compose up -d
```

### Environment-Specific Deployments

The application supports different deployment environments:

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Architecture

The Ninio application follows a modern frontend architecture:

- **Frontend Framework**: React with TypeScript
- **State Management**: React Context API and custom hooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router
- **API Communication**: Fetch API with custom hooks
- **Backend**: Supabase for authentication, database, and storage
- **Testing**: Vitest for unit tests, Cypress for E2E tests
- **Build Tool**: Vite for fast development and optimized builds
- **Visualization**: Three.js for interactive 3D elements

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m 'Add my feature'`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a pull request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a pull request
- Keep pull requests focused on a single feature or bug fix

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Three.js](https://threejs.org/)
- [Supabase](https://supabase.io/)
- [Groq](https://groq.com/)
