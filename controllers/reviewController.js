const Review = require('../model/ReviewNew');
const Product = require('../model/Product');

const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {checkPermissions } = require('../utils');

const createReview = async (req, res) => {
    // Get the product ID First 
    const {product: productId} = req.body;

    // check first if the product passing vaild or exist
    const isValidProduct = await Product.findOne({_id: productId});

    if(!isValidProduct){
        throw new  CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    // check also if the user have already submitted review a specific product
    const alreadySubmitted = await Review.findOne({product: productId, user: req.user.userId,});
    if(alreadySubmitted){
        throw new  CustomError.BadRequestError('Already Subnitted review for this product');         
    }

    //attach user property
  req.body.user = req.user.userId;
  // Create Review
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({review});


 //res.send('create review');
}; 


const getAllReviews = async (req, res) => {
   // const reviews = await Review.find({});
    
   // Add Populate: Populating other Model with the Review Model
    const reviews = await Review.find({}).populate({path: 'product', select: 'name company price', }).populate({path: 'user', select: 'name', });
    //res.send('getAllReviews');
    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
   }; 

const getSingleReview = async (req, res) => {
  const {id:reviewId} = req.params;
  
  const review = await Review.findOne({_id:reviewId});
  if(!review){
    throw new CustomError.NotFoundError(`No review with  id ${reviewId}`);
  }
   // res.send('getSingleReview');
   res.status(StatusCodes.OK).json({review});
   }; 
   
const updateReview = async (req, res) => {
    const {id:reviewId} = req.params;
    const {rating, title, comment} = req.body;
  
    const review = await Review.findOne({_id: reviewId});
    if(!review){
      throw new CustomError.NotFoundError(`No review with  id ${reviewId}`);
    }
      
    // Check Permission for deleting if the person is a user or not
    checkPermissions(req.user, review.user);
    review.rating = rating;
    review.title = title;
    review.comment = comment;

     await review.save();
     //res.send('deleteReview');
     res.status(StatusCodes.OK).json({review});
   }; 
const deleteReview = async (req, res) => {
    const {id:reviewId} = req.params;
  
    const review = await Review.findOne({_id:reviewId});
    if(!review){
      throw new CustomError.NotFoundError(`No review with  id ${reviewId}`);
    }
      
    // Check Permission for deleting if the person is a user or not
    checkPermissions(req.user, review.user);

     await review.remove();
     //res.send('deleteReview');
     res.status(StatusCodes.OK).json({msg: 'Success! Review removed'});
   }; 


const getSingleProductReviews = async(req, res) =>{
  const {id:productId} = req.params;
  const reviews = await Review.find({product:productId});
  res.status(StatusCodes.OK).json({reviews, count: reviews.length});
};   

module.exports = {
    createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReviews,
};
   
