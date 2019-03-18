const mongoose = require('mongoose');
const validator = require('validator');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const task = require('./task')

const usershema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    PPic: {
        type: Buffer
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error('unvalid email');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('age must be positive number');
            }
        }
    },
    password: {
        required: true,
        type: String,
        minlength: 6,
        validate(value) {
            if (validator.isIn(value.toLowerCase(), ['password'])) {
                throw new Error('password, cant be a password');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
}, {
        timestamps: true,
    })
usershema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

usershema.statics.findByCredentials = async (email, password) => {
    console.log('in findbycredentials')
    const user = await User.findOne({ email: email });
    console.log('onefound')
    if (!user) {
        return ("unable to login(email)")
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return (`unable to login(pw) ${password},${user.password}`)
    }
   // console.log(user)
    return user
}

usershema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'this is my new course')
    user.tokens = user.tokens.concat({ token });
    await user.save()

    return token
}

usershema.methods.toJSON = function () { //toJSON will hide the passwrod and tokens from all routes
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.PPic
    return userObject
}
// usershema.pre('save', async function (next) {
//     const user=this
//     if(user.isModified('password')){
//         user.password=await bcrypt.hash(user.password,8)
//     }
//     next()
// })
usershema.pre('remove', async function (next) {
    const user = this
    console.log('pre remove')
    console.log(user._id)
    await task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', usershema)


module.exports = User;