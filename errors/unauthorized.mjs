import StatusCodes from "http-status-codes";
import CustomAPIError from "./custom-api.mjs";

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export default UnauthorizedError;
