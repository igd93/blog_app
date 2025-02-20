## What has been done

- [x] Setup the frontend
  - [x] installed shadcn
  - [x] installed react-router-dom
  - [x] created components
    - [x] HomePage
    - [x] BlogDetailPage
    - [x] LoginPage
    - [x] RegisterPage
    - [x] ProfilePage
    - [x] Header
- [x] Setup the DB
  - [x] Setup the schema
- [x] Setup the backend
  - [x] created spring boot project
  - [x] created the entity classes
  - [x] created the repository interfaces
  - [x] created the service interfaces
  - [x] created the service implementations
  - [x] created the DTOs

## What needs to be done

- [ ] The frontend

  - [x] Create API Client:
    - [x] Set up axios with interceptors
    - [x] Create API service classes
  - [ ] Update Components:
    - [ ] Connect LoginPage to backend
    - [ ] Connect RegisterPage to backend
    - [ ] Connect HomePage to fetch posts
    - [ ] Connect BlogDetailPage to fetch post details
    - [ ] Connect ProfilePage to user data

- [x] The backend

  - [x] Authentication:

    - [x] POST /api/auth/register
    - [x] POST /api/auth/login
    - [x] POST /api/auth/logout

  - [x] Blog Posts:

    - [x] GET /api/posts
    - [x] GET /api/posts/{id}
    - [x] POST /api/posts
    - [x] PUT /api/posts/{id}
    - [x] DELETE /api/posts/{id}

  - [x] Users:

    - [x] GET /api/users/profile
    - [x] PUT /api/users/profile
    - [x] PUT /api/users/password

  - [x] Comments:

    - [x] GET /api/posts/{postId}/comments
    - [x] POST /api/posts/{postId}/comments
    - [x] PUT /api/comments/{id}
    - [x] DELETE /api/comments/{id}

  - [x] Tags:

    - [x] GET /api/tags
    - [x] POST /api/tags

  - [x] Create REST Controllers:
    - [x] AuthController (login, register, logout)
    - [x] BlogController (CRUD operations for posts)
    - [x] UserController (profile operations)
    - [x] CommentController
    - [x] TagController
    - [x] Create DTOs:
      - [x] UserDTO (for registration and profile)
      - [x] BlogPostDTO
      - [x] CommentDTO
      - [x] TagDTO
    - [x] Create Services:
      - [x] AuthService
      - [x] BlogService
      - [x] UserService
      - [x] CommentService
      - [x] TagService
    - [x] Create Repositories:
      - [x] UserRepository
      - [x] BlogPostRepository
      - [x] CommentRepository
      - [x] TagRepository
    - [x] Setup the authentication
      - [x] Spring Security configuration
      - [x] JWT token implementation
    - [x] Setup the authorization
      - [x] Role-based authorization
  - [ ] Setup the logging
  - [ ] Setup the testing
  - [ ] Set up the CI/CD pipeline
  - [ ] Set up the deployment
  - [ ] Set up the monitoring
