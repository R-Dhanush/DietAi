const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  // 1. Get token from header  
  const authHeader = req.header('Authorization');
  console.log("Auth header:", authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    
    let message = 'Invalid token';
    if (err.name === 'TokenExpiredError') message = 'Token expired';
    if (err.name === 'JsonWebTokenError') message = 'Malformed token';

    return res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = auth;