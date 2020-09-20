//defining the model
const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Task = require('./tasks');





const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password cannot contains password");
      }
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true, //triming the spaces
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is not valid");
      }
    },
  },
  age: {
    type: Number,
    default: 0, //if not provided it will assign 0 as default
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be a positive number");
      }
    },
  },//just tracking the token this is not provided by the user but by the server always
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }


}, {
  timestamps: true
});

//relation b/w the user and the task
//we're getting the task from the user using virtual porperty means not in actual db

userSchema.virtual('tasks', { // jsut like we set the user._id as owner in tasks model we virtually set tasks 
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})


//hiding the private data
userSchema.methods.toJSON = function () {
  const user = this;
  //get back a raw object with our user data attached 
  const userObject = user.toObject() //toObject just return the raw profile data
  
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  
  return userObject;
}


///generatng tokens and storing it to db

///And our method are accessible on the instances sometimes called instance methods
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET) // ''

  //saving the user making sure the token is stored in db
  user.tokens = user.tokens.concat({ token: token })
  await user.save()
  return token;
}



//***********LOgging the User */

//remember arrow function here because no this 
//static method are accessible on the model sometimes called Model methods
userSchema.statics.findByCredentials = async (email, password) => {
  //find by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }


  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

//Hash the plain text password before saving  (middleware Power)
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) { //this works for both when the user updates password and the user is created
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


//Delete the tasks when user is removed (middleware Power)
userSchema.pre('remove', async function (next) {
  const user = this
  //delete multiple tasks using just the owner field
  await Task.deleteMany({ owner: user._id })
  next()
})




const User = mongoose.model("User", userSchema);

// const me = new User({
//   name: ' Jane ',
//   email: "MYEMAIL@JANE.com",
//   password: 'JaneME123 '
// });

// me.save().then(() => {
//   console.log(me);
// }).catch((err) => {
//   console.log('Error!', err);
// })

module.exports = User;
