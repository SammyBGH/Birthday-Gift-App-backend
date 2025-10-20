# Birthday App Backend

Node.js/Express backend with MongoDB for the Birthday Gift Collection App.

## Features

- ✅ **Payment Management** - Store and retrieve payment records
- ✅ **MongoDB Integration** - Persistent data storage
- ✅ **RESTful API** - Complete CRUD operations
- ✅ **Statistics** - Payment analytics and summaries
- ✅ **Security** - Rate limiting, CORS, Helmet
- ✅ **Admin Authentication** - Simple credential-based auth

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Install dependencies:**
   ```bash
   cd birthday-app-backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env .env.local
   # Edit .env.local with your MongoDB URI and settings
   ```

3. **Start MongoDB:**
   - Local: `mongod`
   - Or use MongoDB Atlas URI in `.env`

4. **Start the server:**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

The server will run on `http://localhost:5000`

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/birthday-app

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## API Endpoints

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | Get all payments (with pagination) |
| GET | `/api/payments/:id` | Get single payment |
| POST | `/api/payments` | Create new payment |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |
| GET | `/api/payments/stats/summary` | Get payment statistics |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server status |

## Project Structure

```
birthday-app-backend/
├── models/
│   └── Payment.js          # MongoDB Payment schema
├── routes/
│   └── payments.js         # Payment API routes
├── server.js               # Main server file
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## Development

- **Development server:** `npm run dev` (with auto-restart)
- **Production server:** `npm start`
- **Health check:** `http://localhost:5000/api/health`

## Database Schema

### Payment Model

```javascript
{
  name: String (required),
  email: String (required),
  amount: Number (required),
  currency: String (required),
  method: String (required),
  message: String,
  reference: String, // Paystack reference
  status: String (enum: pending, completed, failed, cancelled),
  exchange: String, // For crypto payments
  cryptoSymbol: String, // For crypto payments
  walletAddress: String, // For crypto payments
  txHash: String, // Transaction hash for crypto
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Helmet** - Security headers
- **Rate Limiting** - Prevents abuse (100 req/15min per IP)
- **CORS** - Configurable cross-origin requests
- **Input Validation** - Mongoose schema validation
- **Error Handling** - Proper error responses

## Integration with Frontend

The frontend automatically uses this backend API for:
- ✅ Storing payment records
- ✅ Retrieving payment history
- ✅ Admin dashboard data
- ✅ Payment statistics

No changes needed in frontend - it automatically switches from localStorage to API calls.

## Next Steps

For production deployment:

1. **Deploy backend** to Heroku, DigitalOcean, or similar
2. **Set up MongoDB Atlas** for cloud database
3. **Configure production environment variables**
4. **Add webhook handling** for crypto payment verification
5. **Add email notifications** for payment confirmations

## Troubleshooting

- **Connection refused:** Make sure MongoDB is running
- **CORS errors:** Update `FRONTEND_URL` in `.env`
- **Port conflicts:** Change `PORT` in `.env`

---

**Backend Status:** ✅ **Ready for development and production!**
"# Birthday-Gift-App-backend" 
