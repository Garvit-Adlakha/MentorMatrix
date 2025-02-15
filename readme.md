# Mentor Matrix

Mentor Matrix is a web application designed to streamline mentor-student interaction during minor and major projects, offering project management, progress tracking, and secure communication.

## Features

- User Authentication with JWT and httpOnly cookies
- Real-time updates for project status
- SMTP integration for password reset
- Mentor and student dashboards with file-sharing capabilities
- Validation and error handling using Express-Validator and Custom Error Handling Middleware
- Rate limiting using Express-Rate-Limit
- Secure headers and CORS configuration using Helmet and CORS Middleware
- cloudinary for uploading files

## Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** JWT with httpOnly cookies
- **Email Service:** Nodemailer (SMTP)

## API Endpoints

### **Auth Routes**

- `POST /api/v1/user/signup` - Create a new account
- `POST /api/v1/user/signin` - Authenticate user and set cookie
- `POST /api/v1/user/signout` - Clear authentication session
- `POST /api/v1/user/forgot-password` - Send reset password link via email
- `PATCH /api/v1/auth/reset-password/:token` - Reset user password

### **User Routes**

- `GET /api/v1/user/profile` - Get user profile (protected)
- `PATCH /api/v1/user/profile` - Update profile information

### **Project Routes**

- `POST /api/v1/projects` - Create a new project
- `GET /api/v1/projects` - List projects for the authenticated user
- `PATCH /api/v1/projects/:id` - Update project details
- `DELETE /api/v1/projects/:id` - Remove a project

## Installation

1. Clone the repository:
   ```bash
   git clone hhttps://github.com/Garvit-Adlakha/MentorMatrix.git
   ```
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Set up environment variables in `.env` files for both backend and frontend.
4. Run development servers:
   ```bash
   cd backend && npm run start
   cd ../frontend && npm run dev
   ```

## Contributing

Contributions are welcome! Fork the repository and submit a pull request.

## License

Licensed under the MIT License.

