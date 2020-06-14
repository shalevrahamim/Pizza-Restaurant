const Station = require('./station');

const DOUGH = 'Dough';
const TOPPING = 'Topping';
const OVEN = 'Oven';
const WAITER = 'Waiter';
const DOUGH_TIME = 7000;
const TOPPING_TIME = 4000;
const OVEN_TIME = 10000;
const WAITER_TIME = 5000;

let openTime;
let closeTime;
let orders = [];
let doughChefs = [];
let toppingsChefs = [];
let ovens = [];
let waiters = [];
let pendingDoughs = [];
let pendingToppings = [];
let pendingOvens = [];
let pendingWaiters = [];
let completeOrders = [];

function Reservation(id, pizza)
{
    this.id = id;
    this.pizza = pizza;
    this.doughTime = {};
    this.toppingTime = {};
    this.ovenTime = {};
    this.waiterTime = {};
}

function doughReady(object, reservation)
{
    reservation.doughTime.end = Date.now();
    reservation.doughTime.duration = reservation.doughTime.end-reservation.doughTime.start;
    let i;
    for(i = 0; i < toppingsChefs.length; i++)
    {
        if(toppingsChefs[i].isBusy)
            continue;
        toppingsChefs[i].duration = TOPPING_TIME * (parseInt(reservation.pizza.length/2, 10) + reservation.pizza.length%2);
        reservation.toppingTime.start = Date.now();
        toppingsChefs[i].startPreparation(reservation);
        break;
    }
    if(i === toppingsChefs.length)
        pendingToppings.push(reservation);
    if(pendingDoughs.length !== 0)
    {
        let reservation = pendingDoughs.shift();
        reservation.doughTime.start = Date.now();
        object.startPreparation(reservation);
    }
}

function toppingReady(object, reservation)
{
    reservation.toppingTime.end = Date.now();
    reservation.toppingTime.duration = reservation.toppingTime.end-reservation.toppingTime.start;
    let i;
    for(i = 0; i < ovens.length; i++)
    {
        if(ovens[i].isBusy)
            continue;
        reservation.ovenTime.start = Date.now();
        ovens[i].startPreparation(reservation);
        break;
    }
    if(i === ovens.length)
        pendingOvens.push(reservation);
    if(pendingToppings.length !== 0)
    {
        let reservation = pendingToppings.shift();
        object.duration = TOPPING_TIME * (parseInt(reservation.pizza.length/2, 10) + reservation.pizza.length%2)
        reservation.toppingTime.start = Date.now();
        object.startPreparation(reservation);
    }
}

function ovenReady(object, reservation)
{
    reservation.ovenTime.end = Date.now();
    reservation.ovenTime.duration = reservation.ovenTime.end-reservation.ovenTime.start;
    let i;
    for(i = 0; i < waiters.length; i++)
    {
        if(waiters[i].isBusy)
            continue;
        reservation.waiterTime.start = Date.now();
        waiters[i].startPreparation(reservation);
        break;
    }
    if(i === waiters.length)
        pendingWaiters.push(reservation);
    if(pendingOvens.length !== 0)
    {
        let reservation = pendingOvens.shift();
        reservation.ovenTime.start = Date.now();
        object.startPreparation(reservation);
    }
}

function waiterReady(object, reservation)
{
    reservation.waiterTime.end = Date.now();
    reservation.waiterTime.duration = reservation.waiterTime.end-reservation.waiterTime.start;
    reservation.duration = reservation.waiterTime.end - reservation.doughTime.start; 
    completeOrders.push(reservation);
    if(pendingWaiters.length !== 0)
    {
        let reservation = pendingWaiters.shift();
        reservation.waiterTime.start = Date.now();
        object.startPreparation(reservation);
    }
    else if(isOrdersComlete())
    {
        closeTime = Date.now();
        console.log(completeOrders);
        console.log({openTime: openTime, closeTime: closeTime, duration: closeTime-openTime});
    }
}

function isOrdersComlete()
{
    if(pendingWaiters.length === 0 && pendingOvens.length === 0 && pendingToppings.length === 0 && pendingDoughs.length === 0)
    {
        for(let chef of doughChefs)
        {
            if(chef.isBusy)
                return false;
        }
        for(let chef of toppingsChefs)
        {
            if(chef.isBusy)
                return false;
        }
        for(let oven of ovens)
        {
            if(oven.isBusy)
                return false;
        }
        for(let waiter of waiters)
        {
            if(waiter.isBusy)
                return false;
        }
        return true;
    }
    return false;
}

function init(numOfDoughChefs, numOfToppingsChefs, numOfOvens, numOfWaiters)
{
    for(let i = 0; i < numOfDoughChefs; i++)
    {
        let station = new Station(DOUGH+i, DOUGH, DOUGH_TIME);
        station.on(DOUGH, doughReady);
        doughChefs.push(station);
    }

    for(let i = 0; i < numOfToppingsChefs; i++)
    {
        let station = new Station(TOPPING+i, TOPPING, TOPPING_TIME);
        station.on(TOPPING, toppingReady);
        toppingsChefs.push(station);
    }

    for(let i = 0; i < numOfOvens; i++)
    {
        let station = new Station(OVEN+i, OVEN, OVEN_TIME);
        station.on(OVEN, ovenReady);
        ovens.push(station);
    }

    for(let i = 0; i < numOfWaiters; i++)
    {
        let station = new Station(WAITER+i, WAITER, WAITER_TIME);
        station.on(WAITER, waiterReady);
        waiters.push(station);
    }
}

function open()
{
    openTime = Date.now();
    let i;
    for(i = 0; i < doughChefs.length && i < orders.length; i++)
    {
        let reservation = new Reservation(i, orders[i]);
        reservation.doughTime.start = Date.now();
        doughChefs[i].startPreparation(reservation);
    }

    for(;i < orders.length; i++)
    {
        let reservation = new Reservation(i, orders[i]);
        pendingDoughs.push(reservation);
    }
}

module.exports.init = init;
module.exports.open = open;
module.exports.orders = orders;
module.exports.openTime = openTime;
module.exports.closeTime = closeTime;