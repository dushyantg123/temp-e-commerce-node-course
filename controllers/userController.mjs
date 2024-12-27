import User from "../models/User.mjs";
import * as customError from "../errors/index.mjs";
import { StatusCodes } from "http-status-codes";

import {
  attachCookiesToResponse,
  checkPermissions,
  createTokenUser,
} from "../utils/index.mjs";
const getAllUsers = async (req, resp) => {
  const users = await User.find({ role: "user" }).select("-password");

  resp.send({ users, total: users.length });
};
const getSingleUser = async (req, resp) => {
  console.log("Within get Single User");
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user)
    throw new customError.NotFoundError(`No user with id:${req.params.id}`);

  checkPermissions(req.user, req.params.id);
  resp.send({ user });
};
const showCurrentUser = async (req, resp) => {
  resp.status(StatusCodes.OK).json({ user: req.user });
  //resp.send("Show current user");
};
const updateUser = async (req, resp) => {
  const { name, email } = req.body;
  if (!name || !email)
    throw new customError.BadRequestError(
      "Please provide both the name and email of the user"
    );
  // const user = User.findOne({ _id: req.user.userId });
  // user.name = name;
  // user.email = email;
  // const response = await user.save();
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(resp, tokenUser);

  resp.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, resp) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new customError.BadRequestError(
      "Please enter both the old and the new password "
    );
  const user = await User.findOne({ _id: req.user.userId });
  if (!user)
    throw new customError.NotFoundError(
      "We could not find the user to update the password"
    );
  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch)
    throw new customError.UnauthenticatedError("Invalid credentials");
  user.password = newPassword;
  const response = await user.save();
  resp
    .status(StatusCodes.OK)
    .json({ msg: "Success. User password has been updated" });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
