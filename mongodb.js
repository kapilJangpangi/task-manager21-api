// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient
// const ObjectID = mongodb.ObjectID

const { MongoClient, ObjectID } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manger';

// const id = new ObjectID()
// console.log(id.id.length)
// console.log(id.toHexString().length)



MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error,client) => {
  if(error) {
    return console.log('Unable to connect to database')
  }

  const db = client.db(databaseName);//database refrence 
  
  // db.collection('users').updateOne({ _id: new ObjectID('5f50c34e942eea29047e98b2')}, {
  //   $set: {
  //     name: 'Mike'
  //   },
  //   $inc :{
  //     age: -2
  //   }
  // }).then(res => {
  //   console.log(res);
  // }).catch(err => {
  //   console.log(err);
  // })
  // db.collection('users').updateMany({ name: 'Jessy' }, {
  //   $set: {
  //     name: "Arthur"
  //   },
  //   $inc: {
  //     age: +2
  //   }
  // }).then(res => {
  //   console.log(res);
  // }).catch(err => {
  //   console.log(err);
  // })


  db.collection('users').deleteMany({ age: 19 }).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })
  
  


})