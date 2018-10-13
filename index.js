require('dotenv').config();
const Orchestrator = require('./app-modules/Orchestrator');

console.log("Initing...");
const o = new Orchestrator();
o.init();
