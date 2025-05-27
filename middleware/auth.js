const express = require('express');
const {User} = require('../database/schema');
const bcrypt = require('bcrypt');


function isLoggedIn(req, res, next) {
  
  if (req.session.user) {
    next(); 
  } else {
    res.render('home');
  }
}

module.exports = isLoggedIn;

