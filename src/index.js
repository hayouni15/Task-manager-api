
const express = require('express');
var app = express();
require('./db/mongoose');
const task = require('./models/task');
const userRouter=require('./router/user');
const tasksRouter=require('./router/tasks');
const multer=require('multer')

const port = process.env.PORT  // to add heroku port



app.use(express.json());
app.use(userRouter);
app.use(tasksRouter);




app.listen(port, () => {
    console.log(`server listening on port ${port}`)
});