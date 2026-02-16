const jwt = require('jsonwebtoken');
const SECRET = process.env.API_SECRET_KEY;

/**
 * Generates a token by signing a payload with our secret and setting expiration to one day
 * @param {} payload payload to sign 
 * @returns signed jwt token 
 */
function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' }); // token valid for 1 day
}

/**
 * Verifies an existing token using server secret
 * @param {*} token token to verify
 * @returns boolean if valid token
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Clears a set token cookie
 * @param {*} res 
 */
function clearToken(res) {
  res.clearCookie('token');
}

/**
 * Checks a current user's authentication from their token given when registering or logging in
 * @param {*} req request sent
 * @param {*} res response to be sent
 * @param {*} next moves to next middleware
 * @returns invalid statuses if fails
 */
function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token){
     return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware factory that checks if user is authenticated AND has the required role
 * @param {string} role The role required ('student', 'instructor')
 * @returns middleware function
 */
function requireRole(role) {
  return function(req, res, next) {
    const token = req.cookies.token;
    if (!token){
      return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
      const decoded = jwt.verify(token, SECRET);
      if (decoded.role !== role) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }
      req.user = decoded; // attach user info to req
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

/**
 * Convenience middleware to require student role
 */
const requireStudent = requireRole('student');

/**
 * Convenience middleware to require instructor role
 */
const requireInstructor = requireRole('instructor');

module.exports = {
  authenticate,
  generateToken,
  verifyToken,
  clearToken,
  requireRole,
  requireStudent,
  requireInstructor,
};