require('dotenv').config();
/*
const Orchestrator = require('./app-modules/Orchestrator');

console.log("Initing...");
const o = new Orchestrator();
o.init();
*/


const AnalysisMachine = require('./app-modules/AnalysisMachine');
const SimpleMovingAverage = require('./app-modules/indicators/SimpleMovingAverage');
const MBGateway = require('./app-modules/MBGateway');

const analysisMachine = new AnalysisMachine();
analysisMachine.installIndicator(new SimpleMovingAverage(6, 2));
analysisMachine.fakePrice([1, 2, 3, 4, 6, 8, 9, 11, 13, 3, 5, 6, 7, 8, 9, 20]);

const mbGateway = new MBGateway();
//mbGateway.setupPriceUpdater(analysisMachine);

