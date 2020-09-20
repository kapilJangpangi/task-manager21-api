const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req,res,next) => {
  try {
    //gettig the pattern which is in header request
    const token = req.header('Authorization').replace('Bearer ', '');

    //verifying 
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    //we have embedded the userId _id in the pattern this is we going to use to grab the user from db
    //decoded has the id
    const user = await User.findOne({ _id: decoded._id , 'tokens.token': token})

    if(!user) {
      throw new Error() //this is enough to triggre the catch block
    }
    //if this works we make sure that the router handler runs
    //other thing to give that route handler access to the user that we fetched from the database(line: 14)
    //we can actually add a property  onto the request to store this and the route handler will access this later on
    req.token = token
    req.user = user;
    next()
  } catch(e) {
    res.status(401).send({ error: 'Please authenticate.' })
  }
}
module.exports = auth;
