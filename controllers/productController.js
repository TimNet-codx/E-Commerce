const User = require('../model/user');
const Product = require('../model/Product');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');

const createProduct = async(req, res) =>{
    //res.send('createProduct'); 
      // Get all the require field first
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({product});
};

const getAllProducts = async(req, res) =>{
  //  res.send('getAllProducts')

    // Get all the product First
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({products, count: products.length});
};

const getSingleProduct = async(req, res) =>{
   // res.send('getSingleProduct')
    // Get the Product ID first
    const {id: productId} = req.params;

    const product = await Product.findOne({_id:productId}).populate('reviews');

    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

  res.status(StatusCodes.OK).json({product});
};

const updateProduct = async(req, res) =>{
   // res.send('updateProduct')
   // Get the product ID first
   const {id: productId} = req.params;

   const product = await Product.findByIdAndUpdate({_id: productId}, req.body, {new: true, runValidators: true});

   if(!product){
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
}

res.status(StatusCodes.OK).json({product});
};

const deleteProduct = async(req, res) =>{
   // res.send('deleteProduct')
   // Get the product ID First
   const {id: productId} = req.params;

   const product = await Product.findOne({_id: productId});

   if(!product){
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
}
 
await product.remove();
res.status(StatusCodes.OK).json({msg: 'Success! Product Remove'});
};

const uploadImage = async(req, res) =>{
  // console.log(req.files); 

  // Check if the files exist
  if(!req.files){
    throw new CustomError.BadRequestError('No File Uploaded');
  }
  
  // Check the type(mimetype) is image
  const productImage = req.files.image;
  if(!productImage.mimetype.startsWith('image')){
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  // Check for the size of the image to upload
  const maxSize = 1024 * 1024;
  if(productImage.size > maxSize){// If the product image is bigger than the maxSize throw an error
    throw new CustomError.BadRequestError('Please Upload Image Smaller than 1MB');
  }

  // Get the path module
  const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({image: `/uploads/${productImage.name}`});

  //   res.send('uploadImage')

  // Image upload response and structure, console.log(req.files)
  // {
  //   image: {
  //     name: 'couch.jpeg',
  //     data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 02 1c 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 02 0c 6c 63 6d 73 02 10 00 00 ... 60655 more bytes>,
  //     size: 60705,
  //     encoding: '7bit',
  //     tempFilePath: '',
  //     truncated: false,
  //     mimetype: 'image/jpeg',
  //     md5: '1857fea56af191e516003654dfca13f9',
  //     mv: [Function: mv]
  //   }

};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    uploadImage,
    deleteProduct,
};