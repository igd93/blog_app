# Blog App

A modern blog platform with subscription features built with Spring Boot and React.

## Overview

This is a full-stack blog application that allows users to create blogs, publish posts, and subscribe to other users' content. The application is built as a monorepo with separate backend (Spring Boot) and frontend (React) components.

## Features

- **User Authentication**: Register, login, and profile management
- **Blog Management**: Create, read, update, and delete blogs
- **Post Management**: CRUD operations for posts within blogs
- **Subscription System**: Subscribe/unsubscribe to blogs
- **Public Access**: Visitors can read public blogs and posts
- **File Storage**: Support for image uploads and file attachments

## Tech Stack

### Backend

- Spring Boot
- Spring Security (JWT authentication)
- Spring Data JPA
- PostgreSQL
- MinIO (object storage for file uploads)

### Frontend

- React
- React Router
- Context API/Redux for state management
- Responsive design

### DevOps

- Docker and Docker Compose
- CI/CD pipeline

## Getting Started

### Prerequisites

- JDK 11 or higher
- Node.js and npm
- Docker and Docker Compose
- PostgreSQL (or Docker image)
- MinIO (or Docker image)

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/blog-app.git
cd blog-app
```

2. Set up the backend:

```
cd backend
./mvnw spring-boot:run
```

3. Set up the frontend:

```
cd frontend
npm install
npm start
```

4. Using Docker Compose (alternative):

```
docker-compose up
```

## Project Structure

```
/
├── backend/         # Spring Boot application
├── frontend/        # React application
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [MinIO](https://min.io/)
