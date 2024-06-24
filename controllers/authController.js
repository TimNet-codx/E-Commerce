const User = require('../model/user');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
//const jwt = require('jsonwebtoken');\
// const {createJWT} = require('../utils')
const {attachCookiesToResponse, createTokenUser} = require('../utils')

const register = async (req, res) =>{
    const {email, name, password} = req.body;

    const emailAlreadyExists = await User.findOne({email});
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('Email already exists')
    }
    // First Registered User is an Admin
    const isFirstAccount = await User.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({email, name, password, role});

   // const tokenUser = {name: user.name, userId: user._id, role: user.role};
   const tokenUser = createTokenUser(user);
    //const token = jwt.sign(tokenUser, 'jwtSecret', {expiresIn:'1d'});
    // const token = createJWT({payload: tokenUser});
 
    // const oneDay = 1000 * 60 * 60 * 24
    // res.cookie('token', token, {
    //     httpOnly:true,
    //     expires:new Date(Date.now() + oneDay)
    // });
   // res.send('register user')
  // res.status(StatusCodes.CREATED).json({user});
   //res.status(StatusCodes.CREATED).json({user: tokenUser, token});
   attachCookiesToResponse({res, user:tokenUser})
   res.status(StatusCodes.CREATED).json({user: tokenUser});

};
const login = async (req, res) =>{
    // res.send('login user')
    const {email, password} = req.body;

    if(!email || !password){
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user  = await User.findOne({email});

    if(!user){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
   // const tokenUser = {name: user.name, userId: user._id, role: user.role};
   const tokenUser = createTokenUser(user);

    attachCookiesToResponse({res, user:tokenUser});
    res.status(StatusCodes.OK).json({user: tokenUser});
};
const logout = async (req, res) =>{
   // res.send('logout user')
   res.cookie('token', 'logout', {
    httpOnly: true,
   // expires: new Date(Date.now() + 5 * 1000),// This will return cookies after logged out
    expires: new Date(Date.now()),// This will not return cookies after logged out
   });
   res.status(StatusCodes.OK).json({msg: 'User Logged Out!'});
};

module.exports = {
    register,
    login,
    logout,
};