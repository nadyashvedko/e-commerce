const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const router = express.Router();
const cartShowTemplate = require('../views/carts/show');

//Receive a post request to add item to a cart

router.post('/cart/products', async (req,res) => {

    //figure out the cart
    let cart;

    if(!req.session.cartId){
        //we don't have a cart, we need to create one
        //and store the cart id on the req.session id property

        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    }
    else{
        //we have a cart! lets get it from the repository
        cart = await cartsRepo.getOne(req.session.cartId);

    }
    console.log(cart);

    //either increment quantity for existing product or add new product to items array
    const existingItem = cart.items.find(item => item.id === req.body.productId);
    if(existingItem){
        //increment quantity and save cart
        existingItem.quantity++;
    }
    else{
        //add a new product id to items array
        cart.items.push({id: req.body.productId, quantity: 1});
    }
    await cartsRepo.update(cart.id, {items: cart.items});

    res.redirect('/cart');

})

//Receive a get request

router.get('/cart', async(req,res) => {
    if(!req.session.cartId){
        return res.redirect('/');
    }
    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        const product = await productsRepo.getOne(item.id);

        item.product = product;
    }

    res.send(cartShowTemplate({items: cart.items}));
})

//Receive a post request to delete an item from a cart

router.post('/cart/products/delete', async (req, res) => {
    const {itemId} = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    const items = cart.items.filter(item => item.id !== itemId);

    await cartsRepo.update(req.session.cartId, { items });

    res.redirect('/cart');
});

module.exports = router;