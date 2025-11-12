# Car Sale Backend

A Node.js/Express backend API for the Car Sale application with MongoDB integration.

## Features

- User authentication with JWT
- Expense management
- MongoDB integration with Mongoose
- TypeScript support
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)

3. Start MongoDB:
Make sure MongoDB is running on your system. You can use:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker: `docker run -d -p 27017:27017 --name mongodb mongo`

4. Seed the database (optional):
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Expenses
- `GET /api/expenses` - Get all expenses (requires auth)
- `GET /api/expenses/:id` - Get expense by ID (requires auth)
- `POST /api/expenses` - Create new expense (requires auth)
- `PUT /api/expenses/:id` - Update expense (requires auth)
- `DELETE /api/expenses/:id` - Delete expense (requires auth)
- `GET /api/expenses/stats/summary` - Get expense statistics (requires auth)

### Health Check
- `GET /api/health` - Health check endpoint

## Database Models

### User
- `username`: String (unique, required)
- `password`: String (hashed, required)
- `role`: String (default: 'user')

### Expense
- `category`: String
- `description`: String
- `amount`: Number (required)
- `date`: Date (required)
- `currency`: String (default: 'USD')
- `createdBy`: ObjectId (reference to User)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/carsale` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT secret key | `dev-secret` |
| `NODE_ENV` | Environment | `development` |


