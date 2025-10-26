# Luxe Heritage - Production-Grade E-Commerce Platform

A luxury fashion e-commerce platform built with React, Node.js, Express, and MongoDB Atlas, featuring comprehensive functionality for both customers and administrators.

## 🌟 Features

### Customer Features
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Product Catalog**: Browse luxury fashion items with advanced filtering and search
- **3D Product Visualization**: Interactive 3D models using Three.js and React Three Fiber
- **Shopping Cart**: Persistent cart with quantity management and coupon support
- **Wishlist**: Save favorite items for later
- **User Authentication**: Secure login/registration with role-based access
- **Account Dashboard**: Order history, wishlist management, and account settings
- **Dark Mode**: Seamless light/dark theme toggle
- **SEO Optimized**: Meta tags, structured data, and performance optimization

### Admin Features
- **Dashboard**: Real-time analytics and order management
- **Product Management**: CRUD operations for products with image upload
- **Order Management**: Process orders, update statuses, and manage fulfillment
- **Customer Management**: View customer data and order history
- **Inventory Tracking**: Stock management and low stock alerts

### Technical Features
- **Modern Tech Stack**: React 18, Vite, Tailwind CSS v3.4.1
- **State Management**: Context API for global state
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Code splitting, lazy loading, and optimized builds

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for React
- **React Router v6**: Client-side routing
- **React Three Fiber**: Three.js integration for 3D graphics
- **React Helmet Async**: SEO meta tag management
- **React Hook Form**: Performant form handling
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MongoDB Atlas**: Cloud database service
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Cloudinary**: Image and media management
- **Multer**: File upload middleware
- **Nodemailer**: Email sending service
- **Stripe**: Payment processing
- **Socket.io**: Real-time communication
- **Redis**: Caching and session storage

## 📁 Project Structure

```
luxe-heritage/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database and service configurations
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── README.md              # Project documentation
└── .env.example          # Environment variables template
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kailash1354/Production-level-frontend.git
   cd Production-level-frontend
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Backend (.env file):
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_ethereal_username
   SMTP_PASS=your_ethereal_password
   ```

   Frontend (.env file):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 🔧 Development Commands

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run linter
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

## 📦 Package Versions

### Backend Dependencies
- express: ^4.18.2
- mongoose: ^8.0.3
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- cloudinary: ^1.41.0
- multer: ^1.4.5-lts.1
- cors: ^2.8.5
- helmet: ^7.1.0
- express-rate-limit: ^7.1.5
- express-validator: ^7.0.1
- dotenv: ^16.3.1
- cookie-parser: ^1.4.6
- compression: ^1.7.4
- morgan: ^1.10.0
- nodemailer: ^6.9.7
- stripe: ^14.5.0
- socket.io: ^4.7.4
- redis: ^4.6.10
- winston: ^3.11.0
- joi: ^17.11.0

### Frontend Dependencies
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.22.0
- axios: ^1.6.7
- @tanstack/react-query: ^5.17.19
- framer-motion: ^11.0.5
- @react-three/fiber: ^8.18.0
- @react-three/drei: ^8.20.2
- three: ^0.180.0
- tailwindcss: ^3.4.1
- @vitejs/plugin-react: ^4.2.1
- vite: ^7.1.12

## 🗄 Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  avatar: Object,
  role: String,
  isVerified: Boolean,
  addresses: Array,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  images: Array,
  category: ObjectId,
  brand: String,
  inventory: Object,
  variants: Array,
  reviews: Array,
  ratings: Object,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  items: Array,
  shippingAddress: Object,
  paymentInfo: Object,
  status: String,
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Users register with email, password, and personal details
2. **Login**: Users authenticate with email and password
3. **Token Generation**: Server generates JWT token upon successful login
4. **Token Storage**: Token is stored in localStorage on the client
5. **Protected Routes**: Certain routes require authentication
6. **Role-based Access**: Admin routes require admin privileges

## 📸 File Upload

File uploads are handled using:
- **Multer**: For handling multipart/form-data
- **Cloudinary**: For cloud storage and image optimization
- **Image Processing**: Automatic resizing and format optimization

## 📧 Email Service

Email functionality includes:
- **Registration Confirmation**: Email verification for new users
- **Password Reset**: Secure password reset flow
- **Order Notifications**: Order confirmation and shipping updates
- **Newsletter**: Marketing email capabilities

## 💳 Payment Integration

Payment processing is handled by Stripe:
- **Secure Payments**: PCI compliant payment processing
- **Multiple Payment Methods**: Credit cards, digital wallets
- **Subscription Support**: Recurring payment capabilities
- **Webhook Integration**: Real-time payment event handling

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production mode**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENDGRID_API_KEY=your_sendgrid_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Server-side validation using express-validator
- **Password Hashing**: bcrypt for secure password storage
- **JWT Security**: Secure token generation and validation
- **File Upload Security**: File type and size validation
- **MongoDB Injection Prevention**: Parameterized queries

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: Automatic compression and format selection
- **Caching**: Redis for session storage and API caching
- **Compression**: Gzip compression for responses
- **Database Indexing**: Optimized MongoDB queries
- **CDN Integration**: Static asset delivery optimization

## 🧪 Testing

Run the test suite:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Monitoring and Logging

- **Winston**: Structured logging with multiple transports
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Monitoring**: API response time tracking
- **Health Checks**: Application health monitoring endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@luxeheritage.com or join our Slack channel.

## 📞 Contact

- **Email**: support@luxeheritage.com
- **Website**: https://luxeheritage.com
- **Twitter**: [@luxeheritage](https://twitter.com/luxeheritage)
- **Instagram**: [@luxeheritage](https://instagram.com/luxeheritage)

---

Built with ❤️ by the Luxe Heritage team.