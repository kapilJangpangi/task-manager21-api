const express = require('express');
const Task = require('../models/tasks');
const router = new express.Router();
const auth = require('../middleware/auth');


router.delete('/tasks/:id', auth, async(req,res) => {

  try {
    const tasks = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
    if(!tasks) {
      return res.status(404).send()
    }
    res.send(tasks)
  }catch(e) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async(req,res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['discription', 'complete'];
  const isvalidOperation = updates.every(update => allowedUpdates.includes(update))

  if(!isvalidOperation) {
    return res.status(400).send({ error: 'Invalid Updates' })
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
    //const  task = await Task.findById(req.params.id)

    //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if(!task) {
      return res.status(404).send();
    }
    updates.forEach(update => task[update] = req.body[update]);
    await task.save()
    res.send(task);
  } catch (e) {
    res.status(400).send(e)
  }
})



//GET /tasks?complete=true
//GET /tasks?limit=2&skip=2
//GET /tasks?sortBy=createdAt_desc    (desc/asc) can also use sortBy=createdAt:desc
router.get('/tasks', auth, async(req,res) => {

    const match = {}
    const sort = {}

    if(req.query.complete) {
      match.complete = req.query.complete === 'true'
    }

    if(req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try{
      //const tasks = await Task.find({ owner: req.user._id});
      await req.user.populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort 
          //{
          //   complete: 1 //asc 1 and desc -1
          //   //complete: 1 false one first
          //   //complete: -1 true one first
          // }
        }
      }).execPopulate()
      res.send(req.user.tasks)
    }catch(e) {
      res.status(500).send()
    }

    // Task.find({}).then((tasks) => {
    //   res.send(tasks)
    // }).catch(e => {
    //   res.status(500).send()
    // })
  }
)

router.get('/tasks/:id', auth, async(req,res) => {
  const _id = req.params.id;

  try {
    //const task =  await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id })//we can now only fetch if authenticated and the task I'm fetching is a task i've created
    if(!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send();
  }
  
  // Task.findById(_id).then(task => {
  //   if(!task) {
  //     return res.status(404).send()
  //   }
  //   res.send(task)
  // }).catch(e => {
  //   res.status(500).send();
  // })
})

router.post('/tasks', auth, async(req, res) => {
  const tasks = new Task({
    ...req.body,
    owner: req.user._id
  });


  try {
    tasks.save();
    res.status(201).send(tasks);
  } catch(e) {
    res.status(400).send(e)
  }
  // task.save().then(() => {
  //   res.status(201).send(task);
  // }).catch((e) => {
  //   res.status(400).send(e)
  // })
})


module.exports = router