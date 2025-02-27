const User = require('../model/user');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils');

const getAllUsers = async(req, res) =>{
    console.log(req.user);
    // Getting all the user and remover the password
    const users = await User.find({role:'user'}).select('-password');
    // res.send('get all users route');
    res.status(StatusCodes.OK).json({users});
   
}
const getSingleUser = async(req, res) =>{
    // res.send('get single users route');
   // res.send(req.params);
   console.log(req.user);
   const user = await User.findOne({_id: req.params.id }).select('-password');

   // IF No User With the ID Error Message
   if(!user){
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
   }
   checkPermissions(req.user, user._id);
   res.status(StatusCodes.OK).json({user});
}
const showCurrentUser = async(req, res) =>{
 //   res.send('get curent users route');
 res.status(StatusCodes.OK).json({user: req.user});
}

// Update User with findByIdAndUpdate
// const updateUser = async(req, res) =>{
//    // res.send('get update users route');
//   // res.send(req.body);
//   const {email, name} = req.body;

//   if(!email || !name){
//     throw new CustomError.BadRequestError('Please provide all values');
//   }
//   const user = await User.findByIdAndUpdate({_id: req.user.userId}, {email, name}, {new:true, runValidators:true});
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({res, user: tokenUser});
//   res.status(StatusCodes.OK).json({user: tokenUser});
// }

// Update User with User.Save()
const updateUser = async(req, res) =>{
    // res.send('get update users route');
   // res.send(req.body);
   const {email, name} = req.body;
 
   if(!email || !name){
     throw new CustomError.BadRequestError('Please provide all values');
   }
   const user = await User.findOne({ _id: req.user.userId });

   user.email = email;
   user.name = name;

   await user.save();

   const tokenUser = createTokenUser(user);
   attachCookiesToResponse({res, user: tokenUser});
   res.status(StatusCodes.OK).json({user: tokenUser});
 };
const updateUserPassword = async(req, res) =>{
   // res.send('get update users password route');
 //  res.send(req.body);  
 const {oldPassword, newPassword} = req.body;
 if(!oldPassword || !newPassword){
    throw new CustomError.BadRequestError('Please provide both values');
 }
 const user = await User.findOne({_id: req.user.userId});

 const isPasswordCorrect = await user.comparePassword(oldPassword);
 if(!isPasswordCorrect){
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
 }
 user.password= newPassword;

 await user.save();
 res.status(StatusCodes.OK).json({msg: 'Success! Password Update.'});
};

module.exports ={
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
};
