import { StatusCodes } from "http-status-codes";
import Product from "../models/Product.mjs";
import Review from "../models/Review.mjs";
import Order from "../models/Order.mjs";
import * as customError from "../errors/index.mjs";
import checkPermissions from "../utils/checkPermissions.mjs";

const getAllOrders = async (req, resp) => {
  const orders = await Order.find({});
  resp.status(StatusCodes.OK).json({ orders, total: orders.length });
};

const getSingleOrder = async (req, resp) => {
  const order = await Order.findOne({ _id: req.params.id });
  console.log(order);
  if (order == null)
    new customError.NotFoundError(
      `Order with id=${req.params.id} is not found`
    );
  checkPermissions(req.user, order.user);
  resp.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, resp) => {
  const orders = await Order.find({ user: req.user.userId });
  resp.status(StatusCodes.OK).json({ orders, total: orders.length });
};
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};
const createOrder = async (req, resp) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1)
    throw new customError.BadRequestError("No cart items provided");
  if (!tax || !shippingFee)
    throw new customError.BadRequestError(
      "please provide tax and shipping fee"
    );

  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct)
      throw new customError.NotFoundError(
        `no product with id: ${item.product}`
      );
    const { name, price, image, _id } = dbProduct;
    console.log(name, price, image);
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    //add item to order
    orderItems = [...orderItems, singleOrderItem];
    //calculate subtotal
    subtotal += dbProduct.price * item.amount;
    console.log(orderItems, subtotal);
  }
  //calculate total price
  const total = subtotal + tax + shippingFee;

  //get client secret for stripe
  const paymentIntent = await fakeStripeAPI({ amount: total, currency: "usd" });
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  resp.status(StatusCodes.CREATED).json({
    msg: "Order created successfully",
    order,
    clientSecret: order.clientSecret,
  });
};

const updateOrder = async (req, resp) => {
  const { id: orderId } = req.params;
  const paymentIntentId = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order)
    new customError.NotFoundError(`Order with id=${orderId} is not found`);
  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  resp.status(StatusCodes.OK).json({ msg: "order has been updated", order });
};

export {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
