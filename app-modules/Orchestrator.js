// Recebe as info do mercado e entao faz o processamento dos pedidos (verifica quando é melhor comprar/vender)
// N opera vendido, somente comprado
// Meio de campo com o CHATBOT

const AnalysisMachine = require('./AnalysisMachine');
const SimpleMovingAverage = require('./indicators/SimpleMovingAverage');
const MBGateway = require('./MBGateway');

//mbGateway.setupPriceUpdater(analysisMachine);

const Orchestrator = function () {
	this.init = function () {
		this.gateway = new MBGateway(this);
		this.analysisMachine = new AnalysisMachine(this);
		this.analysisMachine.installIndicator(new SimpleMovingAverage(Number(process.env.TREND_PERIOD), Number(process.env.SIGNAL_PERIOD)));

		//this.gateway.setupPriceUpdater(this.analysisMachine);
		this.analysisMachine.fakePrice([1, 2, 3, 4, 6, 8, 9, 11, 13, 3, 5, 6, 7, 8, 9, 20]);
	}

	this.onSignal = function (signal, price) {
		if (signal > 0){
			return console.log(`Compra = ${price}`);
		}else{
			return console.log(`Vende = ${price}`);
		}
	}
};

module.exports = Orchestrator;