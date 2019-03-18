var express = require('express')
var router = new express.Router()
const task = require('../models/task');
const auth = require('../middleware/auth')
//route to adding tasks
router.post('/tasks', auth, (req, res) => {
    const newtask = new task({
        description: req.body.description,
        completed: req.body.completed,
        owner: req.user._id
    }
    );

    newtask.save().then(() => {
        res.send(newtask);
    }).catch((err) => {
        res.status(400);
        res.send(err);
    })
})

router.get('/tasks', auth, async (req, res) => {
    const match={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    const sort={}
    if(req.query.sortby){
        const parts=req.query.sortby.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }
    console.log(match)
    try {
        const owner = req.user;
        await owner.populate({
            path: 'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        console.log(owner.tasks)
        res.send(owner.tasks);
    }
    catch (err) {
        console.log(err)
        res.status(400).send('error');
    }
})
router.get('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id;
    try {
        const theTask = await task.findOne({ _id: id, owner: req.user._id });
        if (!theTask) {
            return res.status(400).send('no task with such id')
        }
        res.status(200).send(theTask);
    } catch (E) {
        console.log(E)
        res.status(400).send('error');
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    id = req.params.id;
    const thetask = await task.findOne({ _id: id, owner: req.user._id });
    console.log(thetask);
    thetask.completed = true;
    await thetask.save().then((resp) => {
        res.send(resp);
    }).catch((e) => {
        res.send(e);
    });

})
router.delete('/tasks/:id', auth, async (req, res) => {
    id = req.params.id
    try {
        const thetask = await task.findOneAndDelete({ _id: id, owner: req.user._id })
        if (!thetask) {
            res.send('no file was found');
        }
        res.send('file deleted succ')
    }
    catch (e) {
        console.log(e)
        res.status(400).send()
    }

})

module.exports = router
