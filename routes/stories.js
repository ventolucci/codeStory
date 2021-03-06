const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

// Stories Index
router.get('/', (req, res) => {
  Story.find({status:'public'})
    .populate('user')
    .sort({date: 'desc'})
    .then(stories => {
      res.render('stories/index', {
        stories: stories
      });
    });
});

// Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .populate('user')
  .then(story => {
    res.render('stories/show', {
      story: story
    });
  });
});

// list stories from a user
router.get('/user/:userId', (req, res) => {
  Story.find({user: req.params.userId, status: 'public'})
  .populate('user')
  .then(stories => {

    //if the user doesn't have any stories then you want to get the user info by itself
    console.log("Story User: ", stories[0].user)
     res.render('index/profile',{
       stories: stories,
       user: stories[0].user, 
     });
  });
});

//my stories 
router.get('/my', ensureAuthenticated, (req, res) => {
  Story.find({user: req.user.id})
  .populate('user')
  .then(stories => {
    res.render('stories/index', {
      stories: stories
    })
  })
})

// Add Story Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

// Edit Story Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    if(story.user != req.user.id){
      res.redirect('/stories');
      } else {
      res.render('stories/edit', {
        story: story
      });
    }
  });
});

// Process Add Story
router.post('/', (req, res) => {
  let allowComments;

  if(req.body.allowComments){
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments:allowComments,
    user: req.user.id,
    category: req.body.category,
    languages: req.body.languages,
    description: req.body.description,
    repolink: req.body.repolink
  }

  // Create Story
  new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
});

// edit code of the edit code
router.put('/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    let allowComments;

  if(req.body.allowComments){
    allowComments = true;
  } else {
    allowComments = false;
  } 
   //new values
  story.title = req.body.title;
  story.body = req.body.body;
  story.status = req.body.status;
  story.allowComments = allowComments;
  

  story.save()
    .then(story => {
      res.redirect('/dashboard')
    })
  });
});

// Delete form
router.delete('/:id', (req, res) =>{
  Story.remove({_id: req.params.id})
  .then(() => {
    res.redirect('/dashboard');
  });
})



module.exports = router;