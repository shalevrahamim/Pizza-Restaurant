const events = require('events');

class Station extends events.EventEmitter
{
    constructor(name, type, duration)
    {
        super();
        this.name = name;
        this.type = type;
        this.duration = duration;
    }

    startPreparation(reservation)
    {
        console.log(new logStation(this, "Start", reservation));
        this.isBusy = true;
        setTimeout(()=>{
            this.isBusy = false;
            console.log(new logStation(this, "End", reservation));
            this.emit(this.type, this, reservation);
        }, this.duration);
   }
}

function logStation(object, status, reservation)
{
    this.name = object.name;
    this.type = object.type;
    this.status = status;
    this.reservationId = reservation.id;
}

module.exports = Station;