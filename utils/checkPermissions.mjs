import * as customError from "../errors/index.mjs";
const checkPermissions = (requestUser, resourceUserId) => {
  console.log(requestUser);
  console.log(resourceUserId);
  console.log(typeof resourceUserId);
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new customError.UnauthorizedError("Not authorized to access the user");
};

export default checkPermissions;
