const mongoose = require('mongoose');


mongoose.connect(process.env.Mongooseurl, { useNewUrlParser: true, useCreateIndex: true }, (err, client) => {
    if (err) {
        return console.log('unable to connect');
    }
    console.log('connected successfully to database using mongoose');

})



// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false,
//     }
// });

// const me = new User({ name: '        hayouni', age: 25, email: 'hayouni@gmail.com', password: 'PasswoRd' });
// const task = new Task({ description: 'clean the house', completed: false });
// me.save().then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// })

