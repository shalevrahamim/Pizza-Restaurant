const restaurant = require('./pizza-restaurant');
const fs = require('fs');

restaurant.init(2, 3, 1, 2);
fs.readFile('orders.json', (err, data)=>{
    if(err)
        throw err;
    let orders = JSON.parse(data);
    for(let order of orders)
        restaurant.orders.push(order);
    restaurant.open();
})