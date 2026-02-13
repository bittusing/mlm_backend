const rateLimit = require('express-rate-limit');

// IP-based rate limiter for login attempts
// Each IP address gets 5 login attempts per 15 minutes
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 5 requests per IP
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use IP address as the key
  keyGenerator: (req) => {
    // Get IP from various possible sources (handles proxies)
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress;
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    console.log(`Rate limit exceeded for IP: ${ip} on login endpoint`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP address. Please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

// IP-based rate limiter for registration
// Each IP address gets 3 registration attempts per hour
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 3 requests per IP
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress;
  },
  handler: (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    console.log(`Rate limit exceeded for IP: ${ip} on registration endpoint`);
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP address. Please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// IP-based rate limiter for withdrawal requests
// Each IP address gets 10 withdrawal requests per hour
exports.withdrawalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP
  message: {
    success: false,
    message: 'Too many withdrawal requests from this IP, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress;
  },
  handler: (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    console.log(`Rate limit exceeded for IP: ${ip} on withdrawal endpoint`);
    res.status(429).json({
      success: false,
      message: 'Too many withdrawal requests from this IP address. Please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// IP-based rate limiter for general API requests
// Each IP address gets 100 requests per 15 minutes
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 100 requests per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress;
  },
  handler: (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    console.log(`Rate limit exceeded for IP: ${ip} on API endpoint`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address. Please slow down and try again later.',
      retryAfter: '15 minutes'
    });
  },
  // Skip rate limiting for certain conditions (optional)
  skip: (req) => {
    // Skip rate limiting for admin users (optional)
    // return req.user && req.user.role === 'ADMIN';
    return false;
  }
});

// IP-based rate limiter for plan purchase
// Each IP address gets 20 plan purchases per hour
exports.planPurchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per IP
  message: {
    success: false,
    message: 'Too many plan purchase attempts from this IP, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress;
  },
  handler: (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    console.log(`Rate limit exceeded for IP: ${ip} on plan purchase endpoint`);
    res.status(429).json({
      success: false,
      message: 'Too many plan purchase attempts from this IP address. Please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});
