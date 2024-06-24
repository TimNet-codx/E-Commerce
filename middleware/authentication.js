const CustomError = require('../errors');
const {isTokenValid} =  require('../utils');

const authenticateUser  = async(req, res, next) =>{
    const token = req.signedCookies.token;

    // When the token invalid or not present
    if(!token){
       // console.log('error, no token Present');
       throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    // else{
    // console.log('token present');
       
    // }
    
    // When the token is valid or present
    try{
    //    const payload = isTokenValid({token});
    //    console.log(payload);
    const {name, userId, role} = isTokenValid({token});
    req.user = {name, userId, role};
       next();
    }catch (error){
        throw new CustomError.UnauthenticatedError('Authentication Invalid'); 
    }  
};
   
// ...rest is still role
const authorizePermissions = (...roles) => {
    //console.log("Admin Route");
    // if(req.user.role !== 'admin'){
    //     throw new CustomError.UnauthorizeError(' Unauthorized to access this  route');
    // }

    // next();
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
        throw new CustomError.UnauthorizeError('Unauthorized to access this route');
    }
    next();
  };
    
}

module.exports = {
    authenticateUser,
    authorizePermissions,
}