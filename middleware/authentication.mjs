import * as customError from "../errors/index.mjs";
import { isValidToken } from "../utils/jwt.mjs";
const authenticateUser = (req, resp, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    console.log("no token present");
    throw new customError.UnauthenticatedError("Not authorized error");
  } else {
    console.log("token present");
    try {
      const payload = isValidToken(token);
      const { userId, name, role } = payload;
      req.user = { name, userId, role }; //attach the user to the request
      console.log(payload);
      next();
    } catch {
      throw new customError.UnauthenticatedError("Not authorized error");
    }
  }
};

const authorizePermissions = (...roles) => {
  return (req, resp, next) => {
    console.log("admin route");
    if (!roles.includes(req.user.role))
      throw new customError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    next();
  };
};

export { authenticateUser, authorizePermissions };
