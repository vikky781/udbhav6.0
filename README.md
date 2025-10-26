# AI-Driven Peer Review System

A comprehensive full-stack web application for AI-powered academic peer review, featuring intelligent text analysis, plagiarism detection, and structured review processes.

## 🚀 Features

### Core Functionality
- **AI-Powered Analysis**: Advanced NLP algorithms for text and code analysis
- **Plagiarism Detection**: Comprehensive similarity checking against existing submissions
- **Peer Review System**: Structured review process with detailed feedback and rating categories
- **Real-time Feedback**: Instant analysis and feedback generation
- **Collaborative Learning**: Foster collaborative learning through structured peer review processes
- **Comprehensive Reports**: Detailed analytics and reporting for instructors and students

### Technical Features
- **Modern React Frontend**: Built with React 18, React Router, and modern UI components
- **RESTful API**: Node.js/Express.js backend with comprehensive API endpoints
- **Database**: MongoDB with Mongoose ODM for data persistence
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Support for multiple file types and formats
- **Responsive Design**: Mobile-first responsive design with modern UI/UX

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Lucide React** - Modern icon library
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animation library
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload middleware
- **Natural** - Natural language processing
- **Sentiment** - Sentiment analysis
- **Compromise** - Natural language processing

### AI/ML Libraries
- **Natural** - Natural language processing toolkit
- **Sentiment** - Sentiment analysis
- **Compromise** - Natural language processing
- **Diff** - Text comparison and similarity

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-peer-review
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-peer-review
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Setup**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Start MongoDB (if not already running)
   mongod
   ```

5. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## 🏗️ Project Structure

```
ai-peer-review/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── uploads/            # File uploads directory
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Submissions
- `GET /api/submissions` - Get all submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/:id` - Get submission by ID
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission
- `POST /api/submissions/:id/submit` - Submit for review

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create new review
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/submission/:id` - Get reviews for submission

### Analysis
- `POST /api/analysis/text` - Analyze text content
- `POST /api/analysis/code` - Analyze code content
- `POST /api/analysis/plagiarism` - Detect plagiarism
- `POST /api/analysis/comprehensive` - Comprehensive analysis

## 🎯 Usage

### For Students
1. **Register/Login** to your account
2. **Create Submissions** for your projects or assignments
3. **Review Submissions** from other students
4. **View Analytics** of your performance

### For Instructors
1. **Access Analytics Dashboard** for comprehensive insights
2. **Monitor Submissions** and review quality
3. **Manage Reviews** and provide feedback
4. **Generate Reports** for academic assessment

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers

## 📊 AI/ML Capabilities

### Text Analysis
- **Sentiment Analysis** - Determine emotional tone
- **Readability Assessment** - Flesch Reading Ease Score
- **Complexity Analysis** - Lexical diversity and complexity
- **Grammar Checking** - Basic grammar issue detection
- **Keyword Extraction** - Important term identification
- **Entity Recognition** - People, places, organizations

### Code Analysis
- **Complexity Metrics** - Cyclomatic complexity analysis
- **Quality Assessment** - Code quality evaluation
- **Style Analysis** - Coding style consistency
- **Performance Metrics** - Code metrics calculation

### Plagiarism Detection
- **Similarity Checking** - Compare against existing submissions
- **Source Identification** - Identify potential sources
- **Matching Text** - Highlight similar content
- **Confidence Scoring** - Plagiarism probability

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set secure JWT secrets
4. Configure proper CORS settings
5. Use a reverse proxy (nginx)
6. Enable HTTPS

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Machine Learning Models** - Custom ML models for better analysis
- **Real-time Collaboration** - Live editing and commenting
- **Advanced Analytics** - More detailed insights and reporting
- **Mobile App** - Native mobile application
- **API Integration** - Third-party service integrations
- **Automated Grading** - AI-powered automatic grading

---

**Built with ❤️ by the AI Udbhav Team**

