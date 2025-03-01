# MentorMatrix Documentation

## Overview

Mentor Matrix is a comprehensive web application designed to streamline mentor-student interaction during minor and major projects. The platform offers robust project management capabilities, real-time progress tracking, and secure communication channels between mentors and students.

## Key Features

- **User Authentication**
  - JWT-based authentication with httpOnly cookies
  - Secure password reset via email
  - Protected routes and middleware

- **Project Management**
  - Real-time project status updates
  - File sharing capabilities
  - Progress tracking
  - Mentor-student collaboration tools

- **Communication**
  - Real-time chat system
  - File sharing
  - Read receipts
  - Typing indicators

- **Security**
  - JWT with httpOnly cookies
  - Rate limiting protection
  - Secure headers (Helmet)
  - CORS configuration
  - Input validation
  - Error handling middleware

## Tech Stack

### Frontend
- **Core**: React
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer (SMTP)

## Project Structure

```
MentorMatrix/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── database/       # Database configuration
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── socket/        # WebSocket implementation
│   │   ├── utils/         # Utility functions
│   │   ├── constants.js   # Application constants
│   │   └── index.js       # Application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

### Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Garvit-Adlakha/MentorMatrix.git
   cd MentorMatrix
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file with the following variables:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file with:
   ```env
   VITE_API_URL=http://localhost:4000/api/v1
   ```

4. **Run Development Servers**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Core Components

### 1. Authentication System
- JWT-based authentication
- Secure password hashing
- Password reset functionality
- Session management

### 2. Project Management
- Project creation and management
- Team member assignment
- Progress tracking
- File sharing

### 3. Mentor-Student Interaction
- Real-time chat
- File sharing
- Progress updates
- Feedback system

### 4. Security Features
- Rate limiting (100 requests per 15 minutes)
- Secure headers
- CORS protection
- Input validation
- Error handling

## API Documentation

All API endpoints are prefixed with `/api/v1`

### Authentication & User Management

#### User Authentication
- **POST** `/user/signup`
  - Creates a new user account
  - **Body**: 
    ```json
    {
      "email": "string",
      "password": "string",
      "name": "string"
    }
    ```
  - **Response**: User object with JWT token

- **POST** `/user/signin`
  - Authenticates existing user
  - **Body**: 
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response**: User object with JWT token

- **POST** `/user/signout`
  - Signs out current user
  - **Auth**: Required
  - **Response**: Success message

#### User Profile Management
- **GET** `/user/profile`
  - Get current user's profile
  - **Auth**: Required
  - **Response**: User profile object

- **PATCH** `/user/profile`
  - Update user profile
  - **Auth**: Required
  - **Body**: FormData with following fields:
    ```json
    {
      "name": "string (optional)",
      "avatar": "file (optional)"
    }
    ```
  - **Response**: Updated user object

#### Password Management
- **PATCH** `/user/change-password`
  - Change user password
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "currentPassword": "string",
      "newPassword": "string"
    }
    ```

- **POST** `/user/forgot-password`
  - Initiate password reset
  - **Body**:
    ```json
    {
      "email": "string"
    }
    ```
  - **Response**: Success message with reset instructions

- **POST** `/user/reset-password/:token`
  - Reset password using token
  - **Params**: token (received via email)
  - **Body**:
    ```json
    {
      "password": "string"
    }
    ```

### Project Management

#### Project Operations
- **POST** `/project/create-project`
  - Create new project
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "title": "string",
      "description": "string",
      "techStack": ["string"]
    }
    ```

- **POST** `/project/add-members`
  - Add members to project
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "projectId": "string",
      "members": ["userId"]
    }
    ```

- **GET** `/project/get-project`
  - Get project details
  - **Auth**: Required
  - **Query**: `projectId`

- **GET** `/project/list-projects`
  - List all accessible projects
  - **Auth**: Required

#### Mentor Management
- **POST** `/project/request-mentor`
  - Request mentor for project
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "projectId": "string",
      "mentorId": "string"
    }
    ```

- **POST** `/project/assign-mentor/:projectId`
  - Accept/Reject mentor request
  - **Auth**: Required (Mentor only)
  - **Params**: projectId
  - **Body**:
    ```json
    {
      "decision": "boolean"
    }
    ```

### Chat System

#### Chat Management
- **GET** `/chat/chats`
  - Get user's chat list
  - **Auth**: Required
  - **Response**: Array of chat objects

#### Message Operations
- **POST** `/message/chats/:chatId/messages`
  - Send message in chat
  - **Auth**: Required
  - **Params**: chatId
  - **Body**:
    ```json
    {
      "content": "string"
    }
    ```

- **GET** `/message/chats/:chatId/messages`
  - Get chat messages
  - **Auth**: Required
  - **Params**: chatId
  - **Query Parameters**:
    - `limit`: number (optional)
    - `before`: timestamp (optional)

- **POST** `/message/mark-read/:chatId`
  - Mark messages as read
  - **Auth**: Required
  - **Params**: chatId

### Response Formats

#### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Authentication
- All authenticated routes require a valid JWT token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Token is obtained during signin/signup

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applies to all `/api` routes
- Returns 429 Too Many Requests when exceeded

### WebSocket Events
The following events are available through Socket.IO:

- `connection`: Initial socket connection
- `join_chat`: Join a chat room
- `message`: New message in chat
- `typing`: User typing indicator
- `read_receipt`: Message read receipt

## Contributing

We welcome contributions to MentorMatrix! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers directly.
