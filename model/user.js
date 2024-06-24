// const mongoose = require('mongoose');
// const validator = require('validator');
// // password hash
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//     name:{
//         type: String,
//         require:[true, 'Please provide name'],
//         minlength: 3,
//         maxlength: 50,
//     },
//     email: {
//         type: String,
//         unique: true,
//         require: [true, 'Please provide email'],
//         validate:{
//             validator: validator.isEmail ,
//             message: 'Please provide valid email',
//         },
//     },
//     password: {
//         type: String,
//         require: [true, 'Please provide password'],
//     },
//     role: {
//         type: String,
//         enum: ['admin', 'user'],
//         default: 'user',
//     },
// });

// // Hash Password
// UserSchema.pre('save', async function(){
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

// // Function that will compare those Hash password
// UserSchema.method.comparePassword = async function(canditatePassword){
//   const isMatch = await bcrypt.compare(canditatePassword, this.password)
//   return isMatch;
// };


// module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified('name'));
  //console.log('hello');

  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('user', UserSchema);
  