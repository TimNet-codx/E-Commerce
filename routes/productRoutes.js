const express = require('express');
const router = express.Router();
const {authenticateUser, authorizePermissions} = require('../middleware/authentication');

const { createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    uploadImage,
    deleteProduct,} = require('../controllers/productController');
  
const {getSingleProductReviews} = require('../controllers/reviewController');    

    router
    .route('/')
    .post([authenticateUser, authorizePermissions('admin')], createProduct)
    .get(getAllProducts);

    //router.route('/products').get(getAllProducts);
    // router.route('/update').patch(updateProduct);
    router.route('/uploadImage').post([authenticateUser, authorizePermissions('admin')], uploadImage)
    // router.route('/uploadImg').delete(deleteProduct);

    router
    .route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
    .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

    router.route('/:id/reviews').get(getSingleProductReviews);

    module.exports = router;



 

