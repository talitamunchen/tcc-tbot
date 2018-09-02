require('dotenv').config();
const Orchestrator = require('./Orchestrator');

console.log("Initing...");
const o = new Orchestrator();
o.init();
