// Recebe as info do mercado e entao faz o processamento dos pedidos (verifica quando é melhor comprar/vender)
// N opera vendido, somente comprado
// Meio de campo com o CHATBOT

const AnalysisMachine = require('./AnalysisMachine');
const SimpleMovingAverage = require('./indicators/SimpleMovingAverage');
const MBGateway = require('./MBGateway');

//mbGateway.setupPriceUpdater(analysisMachine);

const Orchestrator = function () {
	this.blocked = false;

	this.init = function () {
		this.gateway = new MBGateway(this);
		this.analysisMachine = new AnalysisMachine(this);
		this.analysisMachine.installIndicator(new SimpleMovingAverage(Number(process.env.TREND_PERIOD), Number(process.env.SIGNAL_PERIOD)));

		//this.gateway.setupPriceUpdater(this.analysisMachine);
		this.analysisMachine.fakePrice([1, 2, 3, 4, 6, 8, 9, 11, 13, 3, 5, 6, 7, 8, 9, 20]);
	}

	this.onSignal = function (signal, price) {
		if (this.blocked){
			return console.log(`Blocked, will not execute ${signal == process.env.SIGNAL_BUY ? "buy":"sell"}`);
		}
		//this.blocked = true;
		if (signal == process.env.SIGNAL_BUY){
			this.buyOrderChain(price);
		}else{
			this.sellOrderChain(price);
		}
	}

	this.releaseBlock = function () {
		this.blocked = false;
	}

	this.buyOrderChain = function (price) {
		this.gateway.getBalance(function (err, data){
			if (err){
				console.log(`Error creating buy chain ${err}: ${JSON.stringify(err)}`);
			}
			//console.log(`Data ${JSON.stringify(data, null, 4)}`);
			const balance = Number(Number(data.response_data.balance.brl.available).toFixed(2));
			const coinPair = `BRL${process.env.COIN}`;
			const limitiPrice = price * Number(process.env.BUY_SPREAD_MARGIN);
			const quantity = Number(((Math.floor((balance/limitiPrice) * 1000000)) / 1000000).toFixed(6));

			console.log(`Buying ${quantity} ${coinPair} at ${limitiPrice} for a total of ${(quantity*limitiPrice).toFixed(2)}`);
		});
	}

	this.sellOrderChain = function (price) {
		this.gateway.getBalance(function (err, data){
			if (err){
				console.log(`Error creating sell chain ${err}: ${JSON.stringify(err)}`);
			}
			//console.log(`Data ${JSON.stringify(data, null, 4)}`);
			const balance = Number(data.response_data.balance[process.env.COIN.toLocaleLowerCase()].available);
			const coinPair = `BRL${process.env.COIN}`;
			const limitiPrice = price * Number(process.env.SELL_SPREAD_MARGIN);

			console.log(`Selling ${balance} ${coinPair} at ${limitiPrice}`);
		});
	}
};

module.exports = Orchestrator;