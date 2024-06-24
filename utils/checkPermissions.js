const CustomError = require('../errors');

const checkPermissions = (reqestUser, resourceUserId) => {

    // console.log(reqestUser);
    // console.log(resourceUserId);
    // console.log(typeof resourceUserId);

    if(reqestUser.role === 'admin') return;
    if(reqestUser.userId === resourceUserId.toString()) return
    // if the role is not admin throw erro message
    throw new CustomError.UnauthorizeError('Not authorized to access this route');
};

module.exports = checkPermissions;
