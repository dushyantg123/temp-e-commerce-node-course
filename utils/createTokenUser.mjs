import * as customError from "../errors/index.mjs";
function createTokenUser(user) {
  if (!user) throw new customError.NotFoundError("User is not found");
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  return tokenUser;
}

export default createTokenUser;
