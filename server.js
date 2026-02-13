const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const roiService = require('./services/roiService');

dotenv.config();

const app = express();

// Trust proxy - Important for getting real IP addresses behind proxies (Heroku, Netlify, etc.)
app.set('trust proxy', 1);

// CORS Configuration
// const corsOptions = {
//   origin: [
//     'http://localhost:3000',
//     'https://wealthslink.netlify.app',
//     'https://mlm-backend-git-main-abhilekh-singhs-projects.vercel.app'
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200
// };

app.use(cors({
    origin: [
      'http://localhost:3000',
      'https://wealthslink.netlify.app',
      'https://mlm-backend-git-main-abhilekh-singhs-projects.vercel.app'
    ]
  }))
// Middleware
// app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/commission', require('./routes/commissionRoutes'));

// Cron Job - Monthly ROI Distribution (runs on 1st of every month at 00:00)
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly ROI distribution...');
  await roiService.distributeMonthlyROI();
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

