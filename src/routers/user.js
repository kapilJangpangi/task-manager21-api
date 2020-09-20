const express = require('express')
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')



router.post('/users', async(req,res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token});
  } catch (e) {
    res.status(400).send(e);
  }
  // user.save().then(() => {
  //   res.status(201).send(user)
  // }).catch((e) => {
  //   res.status(400).send(e);
  // }) 
})


//---------logging the user*********************************************************
router.post('/users/login', async(req,res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);//our own method findByCredentail

    const token  = await user.generateAuthToken() //we are using user not User, because we're working on the specific user 

    res.send({ user, token })
  } catch(e) {
    res.status(400).send()
  }
  
})

//--*******logging out
router.post('/users/logout', auth, async(req,res) => {
  try{
    //as we already logged in we have the user data
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token //return true when the token we looking is not in user.tokens-token keeping it in the tokens array if false removing it from the array
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

///___*****logout all 
router.post('/users/logoutAll', auth, async(req,res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch(e) {
    res.status(500).send()
  }
})



router.get('/users/me', auth, async(req,res) => {
//we know this function only run when we authicated
  res.send(req.user)
  
  
})




router.patch('/users/me', auth,async(req,res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age']

  //Check
  const isvalidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isvalidOperation) {
    return res.status(400).send({ error: 'Invalid Updates'})
  }
  try {
    // const user = await User.findById(req.user._id);
    //to update the fields
    updates.forEach((update) => req.user[update] = req.body[update])
    await req.user.save() //this is where our middleware executes
    
    //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    // if(!user) {
    //   return res.status(404).send()
    // }
    res.send(req.user)
  } catch(e) {
    //can one of two things
    //validation related issuse
    //server connection not connecting to db
    console.log(e)
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async(req,res) => {

  try {
    // const users = await User.findByIdAndDelete(req.user._id)
    // if(!users) {
    //   return res.status(404).send()
    // }
    await req.user.remove()
    sendGoodbyeEmail(req.user.email, req.user.name)
    res.send(req.user)
  }catch(e) {
    res.status(500).send(e)
  }
})


const upload = multer({
  limits: {
    fileSize: 1000000// 1Mb this is in bytes
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Please upload image'))
    }
    cb(undefined, true)
  }
})


//both creating and updating the file
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {

  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()// toBuffer to get the data back from sharp as buffer

  req.user.avatar = buffer;
  await req.user.save();

  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

//deleting the avatar for the user
router.delete('/users/me/avatar', auth, async(req,res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})



///serving up the file ,,, read
router.get('/users/:id/avatar', async(req,res) => {

  try {
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png') //send the res via header, about the type of data like jpg,png
    res.send(user.avatar)
  } catch(e) {
    res.status(404).send()
  }

})

module.exports = router;











// router.get('/users/:id', async(req,res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     if(!user) {
//       return res.status(404).send()
//     }
//     res.send(user);
//   } catch(e) {
//     res.status(500).send()
//   }
//   // User.findById(_id).then((user) => {
//   //   if(!user) {
//   //     return res.status(404).send()
//   //   }
//   //   res.send(user);
//   // }).catch((e) => {
//   //   res.status(500).send()
//   // })
//  })