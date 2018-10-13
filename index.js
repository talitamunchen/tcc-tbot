require('dotenv').config();
const Orchestrator = require('./Orchestrator');
const MBGateway = require('./app-modules/MBGateway');

console.log("Initing...");
//const o = new Orchestrator();
//o.init();


const gateway = new MBGateway();

gateway.getOrder('BRLBTC', 54256024, function(err, body) {
    if(err) {
        return console.log(JSON.stringify(err));
    } else {
        return console.log(JSON.stringify(body, null, 4));
    }
});
