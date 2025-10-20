import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['GHS', 'BTC', 'ETH', 'SOL', 'USDT', 'USD'],
    default: 'GHS'
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Mobile Money', 'Bank Transfer', 'Crypto (Binance)', 'Crypto (OKX)']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  reference: {
    type: String,
    unique: true,
    sparse: true // Only required for Paystack payments
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  exchange: {
    type: String,
    enum: ['Binance', 'OKX'],
    required: function() {
      return this.method.includes('Crypto')
    }
  },
  cryptoSymbol: {
    type: String,
    required: function() {
      return this.method.includes('Crypto')
    }
  },
  walletAddress: {
    type: String,
    required: function() {
      return this.method.includes('Crypto')
    }
  },
  txHash: {
    type: String,
    trim: true,
    sparse: true // Optional for crypto payments
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Index for efficient queries
paymentSchema.index({ createdAt: -1 })
paymentSchema.index({ email: 1 })
paymentSchema.index({ reference: 1 })
paymentSchema.index({ status: 1 })

export default mongoose.model('Payment', paymentSchema)
