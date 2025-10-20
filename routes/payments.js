import express from 'express'
import Payment from '../models/Payment.js'

const router = express.Router()

// GET /api/payments - Get all payments (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method, currency } = req.query

    // Build filter object
    const filter = {}
    if (status) filter.status = status
    if (method) filter.method = method
    if (currency) filter.currency = currency

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Payment.countDocuments(filter)

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    })
  }
})

// GET /api/payments/:id - Get single payment
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    res.json({
      success: true,
      data: payment
    })
  } catch (error) {
    console.error('Error fetching payment:', error)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    })
  }
})

// POST /api/payments - Create new payment
router.post('/', async (req, res) => {
  try {
    const paymentData = {
      name: req.body.name,
      email: req.body.email,
      amount: parseFloat(req.body.amount),
      currency: req.body.currency,
      method: req.body.method,
      message: req.body.message,
      reference: req.body.reference,
      status: req.body.status || 'pending',
      exchange: req.body.exchange,
      cryptoSymbol: req.body.cryptoSymbol,
      walletAddress: req.body.walletAddress,
      txHash: req.body.txHash
    }

    const payment = new Payment(paymentData)
    const savedPayment = await payment.save()

    res.status(201).json({
      success: true,
      data: savedPayment,
      message: 'Payment record created successfully'
    })
  } catch (error) {
    console.error('Error creating payment:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    })
  }
})

// PUT /api/payments/:id - Update payment
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      amount: req.body.amount,
      currency: req.body.currency,
      method: req.body.method,
      message: req.body.message,
      status: req.body.status,
      txHash: req.body.txHash
    }

    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key]
      }
    })

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    res.json({
      success: true,
      data: payment,
      message: 'Payment updated successfully'
    })
  } catch (error) {
    console.error('Error updating payment:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      })
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message
    })
  }
})

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id)

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting payment:', error)

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error.message
    })
  }
})

// GET /api/payments/stats/summary - Get payment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ])

    const methodStats = await Payment.aggregate([
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    const currencyStats = await Payment.aggregate([
      {
        $group: {
          _id: '$currency',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          averageAmount: 0,
          completedPayments: 0,
          pendingPayments: 0
        },
        byMethod: methodStats,
        byCurrency: currencyStats
      }
    })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    })
  }
})

export default router
