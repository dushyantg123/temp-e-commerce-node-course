import Product from "../models/Product.mjs";
import StatusCodes from "http-status-codes";
import * as customError from "../errors/index.mjs";
import path from "path";
const createProduct = async (req, resp) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  resp.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, resp) => {
  const product = await Product.find({});
  resp.status(StatusCodes.OK).json({ product, total: product.length });
};

const getSingleProduct = async (req, resp) => {
  const product = await Product.find({ _id: req.params.id }).populate(
    "reviews"
  ); //look in Product model where we setup virtual "reviews"
  resp.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, resp) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product)
    throw new customError.NotFoundError(
      `No product was found matching the id:${productId}`
    );
  resp.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, resp) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  console.log(`product to remove is ${product}`);
  await product.remove();
  resp.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};
const uploadImage = async (req, resp) => {
  if (!req.files) throw new customError.BadRequestError("No file found");
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new customError.BadRequestError("Please upload a file of type image");
  }
  if (productImage.size > 1024 * 1024)
    //1 mb
    throw new customError.BadRequestError("File size cannot be more than 1 MB");
  const imageFile = productImage.name;
  console.log(`imageFile=${imageFile}`);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = join(__filename, "..");
  const imagePath = join(__dirname, "../public", "uploads", imageFile);
  console.log(imagePath);
  await req.files.image.mv(imagePath);
  return resp
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${imageFile}` } });
};

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
