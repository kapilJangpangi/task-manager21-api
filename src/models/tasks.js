const mongoose = require('mongoose');



const taskSchema = new mongoose.Schema(
  {
    discription: {
      type: String, 
      trim: true,
      required: true
    },
    complete: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    } 
  
  },
  {
    timestamps: true
  })
const task = mongoose.model('Task', taskSchema)

module.exports = task;