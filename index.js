require('dotenv').config();
const Orchestrator = require('./app-modules/Orchestrator');

console.log("Waiting for /start on chatbot...");
const o = new Orchestrator();
o.init();
