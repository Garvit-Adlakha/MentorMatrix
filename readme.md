# MentorMatrix
## Live Link 
  https://mentor-matrix.vercel.app/

## Admin Dashboard Demo Video
[![Watch the demo]()](https://drive.google.com/file/d/18eTZJFPvdXYCehsIltx9gpQnXlO0hGS6/view?usp=sharing)

## Demo Video

[![Watch the demo]()](https://drive.google.com/file/d/193BhDNuK40wuWcTuAEsB_vlB18H8C4dZ/view?usp=sharing)

## Overview

MentorMatrix is a full-stack web application designed to streamline mentor-student collaboration for academic projects. It provides robust project management, mentor assignment workflows, secure file/document sharing, AI-powered project summaries and reviews, and real-time group chat for project teams.

## Key Features

- **User Authentication**
  - JWT-based authentication with httpOnly cookies
  - Secure password reset via email
  - Protected routes and middleware

- **Project Management**
  - Create, update, and delete projects with detailed descriptions (abstract, problem statement, methodology, tech stack)
  - Assign team members by email or roll number
  - Request and assign mentors, with mentor approval/rejection workflow
  - File/document upload (with type and extension preserved), download, and deletion for each project
  - AI-generated project summaries and reviews (using Gemini)

- **Mentor Management**
  - Mentor search and filtering by department, expertise, and name
  - Mentor request and approval system

- **AI-Powered Features**
  - Automatic project summarization using PEGASUS model (via FastAPI service)
  - Project review generation with Gemini AI
  - Quality evaluation using ROUGE score metrics

- **Collaboration**
  - Real-time group chat for each project (created when a mentor is assigned)
  - File sharing within projects
  - Activity tracking (project creation, updates, team changes)
  - Meeting creation and updation

- **Security**
  - Role-based access (student, mentor, admin)
  - Only project creators can add members; only team members can upload/delete files
  - Rate limiting, helmet, CORS, and input validation

## Tech Stack

### Frontend
- **Core**: React 
- **State/Data**: React Query, Zustand 
- **Styling**: Tailwind CSS, motion/react,daisy UI,Tabler Icons
- **Build Tool**: Vite
- **HTTP**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.IO
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer (SMTP)
- **AI/ML**: Gemini API

### AI Summarizer Service
- **Framework**: FastAPI
- **ML Models**: PEGASUS (google/pegasus-cnn_dailymail)
- **Evaluation**: ROUGE scorer

## Project Structure

```
MentorMatrix/
├── backend/              # Node.js Express backend
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── database/     # Database configuration
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── socket/       # WebSocket implementation
│   │   ├── utils/        # Utility functions ( Token Generation,Cloudinary, etc.)
│   │   ├── constants.js  # Application constants
│   │   └── index.js      # Application entry point
│   └── package.json
├── frontend/             # React frontend
│   ├── src/
│   │   ├── axios/        # Axios configuration
│   │   ├── components/   # React components
│   │   │   ├── chat/     # Chat components
│   │   │   ├── layouts/  # Layout components (AppLayout, ChatLayout, etc.)
│   │   │   ├── shared/   # Shared components (Header, Navbar, Footer)
│   │   │   ├── ui/       # UI components (Icons, Loaders, Modals, etc.)
│   │   │   └── meetings/ # Meeting components
│   │   ├── data/         # Static data files
│   │   ├── features/     # Feature-specific components organized by domain
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── dashboard/# Dashboard components
│   │   │   └── chat/     # Chat feature components
│   │   ├── libs/         # Utility libraries
│   │   ├── Pages/        # Page components
│   │   ├── router/       # Routing configuration
│   │   ├── service/      # API service modules
│   │   ├── store/        # State management (Zustand stores)
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Root App component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── public/           # Static assets
│   └── package.json
├── SummarizerApi/        # FastAPI based summarization service
│   ├── app.py            # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── model.pkl         # PEGASUS model (not in repo - downloaded separately)
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ (for Summarizer API)
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
   PORT=8000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GEMINI_API_KEY=your_gemini_api_key
   SUMMARIZER_API_URL=http://localhost:8080
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file with:
   ```env
   VITE_API_URL=http://localhost:800/api/v1
   ```

4. **Summarizer API Setup**
   ```bash
   cd SummarizerApi
   pip install -r requirements.txt
   # Download the pretrained model if not included
   # The model will be loaded when the API starts
   ```

5. **Run Development Servers**
   
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
   
   Summarizer API:
   ```bash
   cd SummarizerApi
   uvicorn app:app --reload
   ```

## Core Components

### 1. Authentication System
- JWT-based authentication with httpOnly cookies
- Secure password hashing using bcrypt
- Password reset functionality via email tokens
- Session management

### 2. Project Management
- Project creation and management (title, abstract, problem statement, methodology, tech stack)
- Team member assignment (by email or roll number)
- Mentor request/assignment workflow
- File/document upload, download, and deletion (with extension/type preserved)
- AI-generated project summaries and reviews

### 3. AI Features
- **Project Summarization**:
  - Uses PEGASUS model for concise project summaries
  - Combines all project fields (title, abstract, problem statement, etc.)
  - Generated automatically on project creation/update
  - Accessed through dedicated UI in project details

- **Project Review Generation**:
  - Uses Gemini API for detailed project assessment
  - Provides scoring, strengths, improvement areas, and risk assessment
  - Generated on-demand for team members
  - Structured format for consistent UI parsing

### 4. Mentor-Student Interaction
- Real-time group chat (created when mentor is assigned)
- File sharing
- Progress/activity tracking
- Feedback system (AI review)

### 5. Security Features
- Role-based access (student, mentor, admin)
- Rate limiting (100 requests per 15 minutes)
- Secure headers (Helmet)
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
      "name": "string",
      "role": "student|mentor|admin",
      "roll_no": "string (required for students)",
      "sap_id": "string (required for students)",
      "department": "string (optional)",
      "skills": ["string"] (optional)
    }
    ```
  - **Response**: User object with JWT token in httpOnly cookie

- **POST** `/user/signin`
  - Authenticates existing user
  - **Body**: 
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response**: User object with JWT token in httpOnly cookie

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
      "avatar": "file (optional)",
      "bio": "string (optional)",
      "department": "string (optional)",
      "skills": ["string"] (optional),
      "expertise": ["string"] (optional, mentors only)
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
      "description": {
        "abstract": "string",
        "problemStatement": "string",
        "proposedMethodology": "string",
        "techStack": ["string"]
      },
      "teamMembers": ["email or roll_no"],
      "targetFaculty": "string (optional)"
    }
    ```
  - **Response**: Created project with automatically generated summary

- **POST** `/project/add-members`
  - Add members to project
  - **Auth**: Required (team leader only)
  - **Body**:
    ```json
    {
      "projectId": "string",
      "teamMembers": ["email or roll_no"]
    }
    ```

- **GET** `/project/get-project`
  - Get all projects for current user (created/joined/assigned/requested)
  - **Auth**: Required

- **GET** `/project/get-project/:projectId`
  - Get a single project by ID
  - **Auth**: Required

- **PUT** `/project/:projectId/document/upload`
  - Upload a document to a project
  - **Auth**: Required (team member or mentor)
  - **Body**: FormData with:
    ```
    file: File object
    type: 'project SRS' | 'presentation' | 'report' | 'other'
    ```
  - **Notes**: 
    - File extension is preserved automatically through original filename
    - Content-Type should be 'multipart/form-data'
    - Duplicate filenames are rejected
    - File is stored in Cloudinary and reference is saved in MongoDB
    - Local files are automatically cleaned up after upload or on error

- **DELETE** `/project/:projectId/document/:documentId`
  - Delete a document from a project
  - **Auth**: Required (team member or mentor)
  - **Notes**: Removes document from both MongoDB and Cloudinary storage

#### AI Features

- **GET** `/project/:projectId/summary`
  - Get AI-generated summary for a project
  - **Auth**: Required
  - **Response**: 
    ```json
    {
      "success": true,
      "message": "Project summary fetched successfully",
      "summary": {
        "summary": "string"
      }
    }
    ```
  - **Notes**: Summary is generated automatically on project creation/update

- **GET** `/project/project-review/:projectId`
  - Get or generate an AI review for a project
  - **Auth**: Required (team members only)
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Project review fetched/generated successfully",
      "review": "structured review text with sections for score, strengths, improvements, and risks"
    }
    ```
  - **Notes**: 
    - If review doesn't exist, it's automatically generated
    - Review is structured in specific sections for UI parsing

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
  - **Notes**: Email notifications are sent to both mentor and requester

- **POST** `/project/assign-mentor/:projectId`
  - Accept/Reject mentor request
  - **Auth**: Required (Mentor only)
  - **Params**: projectId
  - **Body**:
    ```json
    {
      "decision": "accept" | "reject"
    }
    ```
  - **Notes**: 
    - When accepted: Group chat is created, project status becomes "approved", all team members are notified
    - When rejected: Project status becomes "rejected", all team members are notified

- **GET** `/project/list-projects`
  - List all projects (mentors/admins only)
  - **Auth**: Required
  - **Query Parameters**:
    - `page`: number (default: 1)
    - `limit`: number (default: 10, max: 50)
    - `status`: "pending" | "approved" | "rejected" | "completed"
    - `mentor`: mentorId
    - `search`: search term for project title

### Mentor Search
- **GET** `/user/mentor/search`
  - Search mentors by name, department, or expertise
  - **Auth**: Required
  - **Query Parameters**:
    - `query`: search term

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

### Summarizer API Endpoints (Separate FastAPI Service)

- **POST** `/api/summarize/`
  - Generate summary from any text
  - **Body**:
    ```json
    {
      "text": "string",
      "max_length": 150,
      "num_beams": 4
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "summary": "string"
    }
    ```

- **POST** `/api/summarize-project/`
  - Generate summary specifically for project data
  - **Body**:
    ```json
    {
      "project": {
        "title": "string",
        "description": {
          "abstract": "string",
          "problemStatement": "string",
          "proposedMethodology": "string",
          "expectedOutcomes": "string (optional)",
          "relevance": "string (optional)",
          "techStack": ["string"] (optional)
        },
        "team_members": ["string"] (optional)
      },
      "max_length": 150,
      "num_beams": 4
    }
    ```

- **POST** `/api/evaluate-summary/`
  - Evaluate quality of generated summary using ROUGE scores
  - **Body**:
    ```json
    {
      "reference": "string",
      "generated": "string"
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "scores": {
        "rouge1": {
          "precision": 0.0,
          "recall": 0.0,
          "f1": 0.0
        },
        "rouge2": {
          "precision": 0.0,
          "recall": 0.0,
          "f1": 0.0
        },
        "rougeL": {
          "precision": 0.0,
          "recall": 0.0,
          "f1": 0.0
        }
      }
    }
    ```

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    // Error details
  }
}
```

## Authentication
- All authenticated routes require a valid JWT token in the httpOnly cookie
- Token is obtained during signin/signup
- Token expiration is handled with automatic refresh

## File Upload Process
1. Files are first uploaded to the server using multer middleware
2. The file is then processed and uploaded to Cloudinary
3. After successful upload, local temporary files are automatically deleted
4. Document metadata is saved in the MongoDB database with:
   - Original filename (preserving extension)
   - Cloudinary public_id
   - Cloudinary secure URL
   - MIME type
   - Upload timestamp
   - Document type (SRS, presentation, report, etc.)
5. Duplicate filenames are prevented within the same project

## Rate Limiting
- 100 requests per 15 minutes per IP
- Applies to all `/api` routes
- Returns 429 Too Many Requests when exceeded

## WebSocket Events
The following events are available through Socket.IO:

- `connection`: Initial socket connection
- `joinChat`: Join a chat room
- `message`: New message in chat
- `typing`: User typing indicator
- `readReceipt`: Message read receipt
- `disconnect`: User disconnect event

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
https://github.com/Garvit-Adlakha/MentorMatrix
