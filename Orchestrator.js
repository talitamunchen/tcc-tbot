const Gateway = require('./gateways/MBGateway');

const Orchestrator = function () {

	this.priceUpdated = function (price) {
		console.log(`New Price ${price}`);
	}

	this.init = function () {
		this.gateway = new Gateway(this);
		this.gateway.setupPriceUpdater();
	}
};

module.exports = Orchestrator;