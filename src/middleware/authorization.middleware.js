/**
 * @filename authorization.middleware.js
 * @description This middleware function verifies if the authenticated user has the necessary role to access a specific route. It takes an array
 * of allowed roles as input. If the user's role is not included in this array, a 403 Forbidden error is returned. Otherwise, execution proceeds
 * to the next middleware function.  This ensures role-based access control in the application.
 *
 * @version v1.0.0
 * @updated Aug 25 2025
 * @author Deviprasad Rai P <dpraidola@gmail.com>
 */

module.exports = (roles = []) => {
  /**
   * Express middleware function to check authorization.
   * @param {object} req - The express request object.  Must contain req.user with a role property.
   * @param {object} res - The express response object.
   * @param {function} next - The next middleware function in the chain.
   */
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles.
    if (!roles.includes(req.user.role)) {
      // If the user's role is not allowed, return a 403 Forbidden error.
      return res
        .status(403)
        .json({ message: "This action is prohibited for you." });
    }
    // If the user's role is allowed, proceed to the next middleware.
    next();
  };
};
