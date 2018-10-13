require('dotenv').config();
const Orchestrator = require('./Orchestrator');
const MBGateway = require('./app-modules/MBGateway');

console.log("Initing...");
//const o = new Orchestrator();
//o.init();


const gateway = new MBGateway();

gateway.createBuyOrder('BRLBTC', 0.001, 20951.00, function(err, body) {
    if(err) {
        return console.log(JSON.stringify(err));
    } else {
        return console.log(JSON.stringify(body, null, 4));
    }
});


/*
const DataCache = require('./app-modules/DataCache');
DataCache.nextMBNonce((err, nonce) => {
    if(err) {
        return console.log(JSON.stringify(err));
    } else {
        return console.log(nonce);
    }
});
*/