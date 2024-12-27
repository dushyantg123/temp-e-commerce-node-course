import StatusCodes from "http-status-codes";
import User from "../models/User.mjs";
import * as customError from "../errors/index.mjs";
import { attachCookiesToResponse, createTokenUser } from "../utils/index.mjs";
import "dotenv/config";

const register = async (req, resp) => {
  const { email, name, password } = req.body;
  console.log("Inside register email is:" + email);
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists)
    throw new customError.BadRequestError("Email already exists");
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ email, name, password, role });
  const tokenUser = createTokenUser(user);

  const oneDay = 1000 * 60 * 60 * 24;
  attachCookiesToResponse(resp, tokenUser);
  resp.status(StatusCodes.CREATED).send({ user: tokenUser });
};
const login = async (req, resp) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new customError.BadRequestError(
      "Please enter both email and password to login"
    );
  const foundUser = await User.findOne({ email });
  if (!foundUser)
    throw new customError.UnauthenticatedError("Invalid credentials entered");

  const isPasswordCorrect = await foundUser.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new customError.UnauthenticatedError("Invalid Credentials");
  }
  const tokenUser = createTokenUser(foundUser);

  const oneDay = 1000 * 60 * 60 * 24;
  attachCookiesToResponse(resp, tokenUser);
  resp.status(StatusCodes.CREATED).send({ user: tokenUser });
};
const logout = async (req, resp) => {
  const token = req.cookies?.token || "No token provided"; // Fallback for debugging

  resp.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 5000),
  });
  resp.status(StatusCodes.OK).send({ msg: "logged out user", token });
};
export { register, login, logout };
