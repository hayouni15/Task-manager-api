var express = require('express')
const auth = require('../middleware/auth')
var router = new express.Router()
const user = require('../models/user');
var bcrypt = require('bcryptjs');
var multer = require('multer')
const sharp = require('sharp');
const sendEmail=require('../emails/account').sendEmail
const RemovalEmail=require('../emails/account').RemovalEmail
var upload = multer({
    //dest: 'uploads/',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('please upload image'))
        }
        cb(undefined, true)
    }
})

//signup
router.post('/users', async (req, res) => {
    console.log(req.body);
    const newuser = req.body;

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(req.body.password, salt)
    newuser.password = hash;
    const me = new user(newuser);
    try {
        await me.save()
        const token = await me.generateAuthToken();
        sendEmail(me.email,me.name)
        res.send({ me, token })
    } catch (e) {
        return res.send(e);
    }

})
//login
router.post('/users/login', async (req, res) => {

    try {
        var TheUser = await user.findByCredentials(req.body.email, req.body.password);
        const token = await TheUser.generateAuthToken();
        //console.log(token)
        res.send({ TheUser, token })
    } catch (e) {
        console.log(e)
        res.status(400).send('unable too login');
    }
})
//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.status(200).send('logged out successfully');
    } catch (E) {
        res.status(500).send('can\'t logout')
    }
})
//logout all
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send('loggedout from all accounts')
    }
    catch (e) {
        console.log(e)
        res.status(500).send();
    }
})
//get user
router.get('/users/me', auth, (req, res) => {
    res.send(req.user)
})
//get user by id
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const users = await user.findOne({ _id: _id });
        res.send(users)
    } catch{
        res.status(500).send();
    }
})

//update account
router.patch('/users', auth, async (req, res) => {
    const updates = req.body
    const keys = Object.keys(req.body);
    console.log(keys)
    try {
        keys.forEach((key) => {

            req.user[key] = req.body[key]
        })
        if (keys.includes('password')) {
            req.user.password = await encrypt(req.body.password)
        }
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})
//delete account 
router.delete('/users', auth, async (req, res) => {
    try {
        const id = req.user._id;
        await req.user.remove()
        RemovalEmail(req.user.email,req.user.name)
        res.send('removed')
    }
    catch (e) {
        console.log(e)
        res.send('something went wrong');
    }
})
//add profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
const buffer=await sharp(req.file.buffer).resize({width:400,height:250}).png().toBuffer();

    req.user.PPic = buffer
    await req.user.save()
    res.send(`${req.user.name} profile pic was uploaded`)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, (req, res) => {
    req.user.PPic = undefined;
    req.user.save()
    res.send('PPIC deleted')
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const Theuser = await user.findById(req.params.id)
        if (!Theuser || !Theuser.PPic) {
            throw new Error()
        }
        res.set('Content-Type','image/png').send(Theuser.PPic)
    } catch (e) {
        res.status(404).send()
    }
})


const encrypt = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(pass, salt)
    return hash;
}


module.exports = router;
