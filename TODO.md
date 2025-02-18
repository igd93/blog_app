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

  - [ ] Create API Client:
    - [ ] Set up axios with interceptors
    - [ ] Create API service classes
  - [ ] Update Components:
    - [ ] Connect LoginPage to backend
    - [ ] Connect RegisterPage to backend
    - [ ] Connect HomePage to fetch posts
    - [ ] Connect BlogDetailPage to fetch post details
    - [ ] Connect ProfilePage to user data

- [x] The backend

  - [ ] Authentication:

    - [ ] POST /api/auth/register
    - [ ] POST /api/auth/login
    - [ ] POST /api/auth/logout

  - [ ] Blog Posts:

    - [ ] GET /api/posts
    - [ ] GET /api/posts/{id}
    - [ ] POST /api/posts
    - [ ] PUT /api/posts/{id}
    - [ ] DELETE /api/posts/{id}

  - [ ] Users:

    - [ ] GET /api/users/profile
    - [ ] PUT /api/users/profile
    - [ ] PUT /api/users/password

  - [ ] Comments:

    - [ ] GET /api/posts/{postId}/comments
    - [ ] POST /api/posts/{postId}/comments
    - [ ] PUT /api/comments/{id}
    - [ ] DELETE /api/comments/{id}

  - [ ] Tags:

    - [ ] GET /api/tags
    - [ ] POST /api/tags

  - [ ] Create REST Controllers:
    - [ ] AuthController (login, register, logout)
    - [ ] BlogController (CRUD operations for posts)
    - [ ] UserController (profile operations)
    - [ ] CommentController
    - [ ] TagController
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
    - [ ] Setup the authentication
      - [ ] Spring Security configuration
      - [ ] JWT token implementation
    - [ ] Setup the authorization
      - [ ] Role-based authorization
  - [ ] Setup the logging
  - [ ] Setup the testing
  - [ ] Set up the CI/CD pipeline
  - [ ] Set up the deployment
  - [ ] Set up the monitoring
