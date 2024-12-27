import jwt from "jsonwebtoken";
import "dotenv/config";
const createJWT = function (payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIMEOUT,
  });
  return token;
};
const isValidToken = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = function (resp, tokenUser) {
  const token = createJWT(tokenUser); //first create a JWT token and then attach it to cookie in the response to store it on the browser.
  const oneDay = 1000 * 60 * 60 * 24; //1 day cookie
  //name of cookie is token
  resp.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    signed: true,
    secure: process.env.ENV_NODE === "production",
  });
};
export { createJWT, isValidToken, attachCookiesToResponse };
