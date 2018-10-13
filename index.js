require('dotenv').config();
/*
const Orchestrator = require('./app-modules/Orchestrator');

console.log("Initing...");
const o = new Orchestrator();
o.init();
*/


const AnalysisMachine = require('./app-modules/AnalysisMachine');
const SimpleMovingAverage = require('./app-modules/indicators/SimpleMovingAverage');

const a = new AnalysisMachine();
a.installIndicator(new SimpleMovingAverage(6, 2));
a.gambi();

