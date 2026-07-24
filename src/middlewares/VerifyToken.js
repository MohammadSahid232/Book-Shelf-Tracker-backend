const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Access Denied: No token provided');
  }
  const token = authHeader.split(' ')[1];
  console.log("Extracted Token:", token);
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = verified;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token Expired');
    }
    res.status(400).send('Invalid Token');
  }
};

module.exports = verifyToken;
