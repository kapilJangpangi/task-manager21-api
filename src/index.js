const express = require('express');
require('./db/mongoose'); // to make sure that mongoose is connected to DB

const userRouter = require('./routers/user');
const tasksRouter = require('./routers/tasks');

const app = express();
const port = process.env.PORT;







app.use(express.json()) //automatically parse the incoming JSON to an object
app.use(userRouter);//routers
app.use(tasksRouter);//routers


app.listen(port, () => {
  console.log('Server is up on port ' + port)
})

