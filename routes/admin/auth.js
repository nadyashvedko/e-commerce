const express = require('express');

const {handleErrors} = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signUpTemplate = require('../../views/admin/auth/signup');
const signInTemplate = require('../../views/admin/auth/signin');
const {requireEmail,
    requirePassword,
    requirePasswordConfirmation,
    requireValidEmail,
    requireValidPassword} = require('../admin/validators');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signUpTemplate({req}));
});

router.post('/signup',
    [requireEmail, requirePassword, requirePasswordConfirmation],
    handleErrors(signUpTemplate),
    async (req, res) => {
        const {email, password, passwordConfirmation} = req.body;
        const user = await usersRepo.create({email, password});
        req.session.userId = user.id;
        res.redirect('/admin/products');
    });

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out');
});

router.get('/signin', (req, res) => {
    res.send(signInTemplate({}));
});

router.post('/signin', [
    requireValidEmail,
    requireValidPassword
],
    handleErrors(signInTemplate),
    async (req, res) => {
    const {email} = req.body;
    const user = await usersRepo.getOneBy({email});
    req.session.userId = user.id;

    res.redirect('/admin/products')
});

module.exports = router;