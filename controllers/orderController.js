const Review = require('../model/ReviewNew');
const Product = require('../model/Product');
const Order = require('../model/Order');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {checkPermissions } = require('../utils');


const fakeStripeAPI = async ({amount, currency})=>{
    const Client_secret = 'someRandomValue';
    return { Client_secret, amount };
};

const createOrder = async (req, res) =>{
    const {items: cartItems, tax, shippingFee} = req.body;
    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('No cart items provided');
    }
    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('Please provide tax and shipping fee');
    }
    
    let orderItems = [];
    let subtotal = 0;

    for(const item of cartItems){
        const dbProduct= await Product.findOne({ _id: item.product });
        if(!dbProduct){
            throw new CustomError.NotFoundError(`No product with Id : ${item.product}`); 
        }
        const {name, price, image, _id} = dbProduct;
       // console.log(name, price, image);
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };
        // add item to order
        orderItems = [...orderItems, singleOrderItem]
        // calculate subTotal
        subtotal += item.amount * price;
    }
    console.log(orderItems)
    console.log(subtotal);
    // Calculate total
    const total = tax + shippingFee + subtotal
    // get Client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    });
   // now we finally create the order
   const order = await Order.create({
   orderItems, total, subtotal, tax, shippingFee, clientSecret: paymentIntent.Client_secret, user: req.user.userId,
   });
    //res.send('create order')
    res.status(StatusCodes.CREATED).json({order, clientSecret: order.Client_secret});
};
const getAllOrders = async (req, res) =>{
    const orders = await Order.find({});
   // res.send('getAllOrders')
   res.status(StatusCodes.OK).json({orders, count: orders.length});
}
const getSingleOrder = async (req, res) =>{
    const {id:orderId} = req.params;
    const order = await Order.findOne({_id:orderId});
    if(!order) {
        throw new CustomError.NotFoundError(`No order with idn: ${orderId}`);
    }
    checkPermissions(req.user, order.user);

    //res.send('getSingleOrder')
    res.status(StatusCodes.OK).json({order});
}
const getCurrentUserOrders = async (req, res) =>{
    const orders = await Order.find({user:req.user.userId});
    //res.send('getCurrentUserOrders')
    res.status(StatusCodes.OK).json({orders, count: orders.length});
}
const updateOrder = async (req, res) =>{
    const {id:orderId} = req.params;
    const {paymentIntentId} = req.body;
    const order = await Order.findOne({_id:orderId});
    if(!order) {
        throw new CustomError.NotFoundError(`No order with idn: ${orderId}`);
    }
    checkPermissions(req.user, order.user);
    
    //where the update change to
    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';
    await order.save();

    //res.send('updateOrder')
    res.status(StatusCodes.OK).json({order}); 
}

module.exports = {
    getAllOrders,
    getSingleOrder, 
    getCurrentUserOrders,
    createOrder, 
    updateOrder,
}