const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
    rating: {
        type:Number,
        min:1,
        max:5,
        required: [true, 'Please provide rating'],
},
title: {
    type: String,
    trim: true,
    required: [true, 'Please provide title'],
    maxlength: 100,
},
comment: {
    type: String,
    required: [true, 'Please provide review text'],
},
user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
},
product:{
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: true,
},
},
{timestamps: true}
);

// Set to Compound Index in order to leave only one review per product and Per user
 ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

 //we the below method statics because we are calling within the Schema here.....
 ReviewSchema.statics.calculateAverageRating = async function (productId){
   // console.log(productId);
   const result = await this.aggregate([
    {$match:{product:productId}},
    {$group:{
        _id:null,
        averageRating:{$avg: '$rating'},
        numOfReviews:{ $sum: 1 },
    }}
   ]);
   console.log(result);
   // Update the Product here
   try {
      await this.model('Product').findOneAndUpdate(
        { _id: productId },
        {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0, 
      }
    );
   } catch (error){
       console.log(error); 
   }
 };

 ReviewSchema.post('save', async function(){
   // console.log('post save hook called');
   await this.constructor.calculateAverageRating(this.product);
 })
 ReviewSchema.post('remove', async function(){
   // console.log('post remove hook called');
   await this.constructor.calculateAverageRating(this.product);

 })
module.exports = mongoose.model('ReviewNew', ReviewSchema );