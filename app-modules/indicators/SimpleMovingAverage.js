const SimpleMovingAverage = function (trendPeriod, signalPeriod){
    this.trendPeriod = trendPeriod;
    this.signalPeriod = signalPeriod;
    this.prices = [];

    this.lastCross = null;
    this.CROSS_HIGH = 1;
    this.CROSS_LOW = -1;

    //Assimila um novo preco > executa algoritmo > emite sinal
    this.indicatorSignal = function (price, callback){
        this.prices.push(price);
        if (this.prices.length < trendPeriod){ //nao ha valores suficientes?
            return callback(null); //nenhum sinal
        }else if (this.prices.length > trendPeriod){ //ha valores demais?
            this.prices.shift(); //remove o mais antigo
        }

        //calcula medias
        const signalPrices = this.prices.slice(trendPeriod - signalPeriod);
        const trendAverage = this.calcAverage(this.prices); //tendencia
        const signalAverage = this.calcAverage(signalPrices); //sinal

        //console.log(`${JSON.stringify(this.prices)} - ${JSON.stringify(signalPrices)}`);
        //console.log(`${trendAverage} - ${signalAverage}`);

        if (trendAverage == signalAverage){
            return callback(null); //nenhum sinal
        }else{
            const cross = (signalAverage > trendAverage) ? this.CROSS_HIGH:this.CROSS_LOW;
            if (this.lastCross && this.lastCross != cross){
                this.lastCross = cross;
                const signal = (cross == this.CROSS_HIGH) ? process.env.SIGNAL_BUY:process.env.SIGNAL_SELL; //1 = buy and -1 = sell
                return callback ({
                    signal: signal, //compra ou venda
                    price: price //ultimo preco, preco que disparou o sinal
                });
            }else{
                this.lastCross = cross;
                return callback(null);
            }
        }
    }
    
    this.calcAverage = function (arr){
        let sum = 0;
        arr.forEach(e => {
            sum += e;
        });
        return sum/arr.length;
    }


}

module.exports = SimpleMovingAverage;