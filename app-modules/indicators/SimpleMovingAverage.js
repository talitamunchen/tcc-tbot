const fs = require('fs');

const SimpleMovingAverage = function (trendPeriod, signalPeriod){
    this.trendPeriod = trendPeriod;
    this.signalPeriod = signalPeriod;
    this.prices = [];
    this.trendArray = [];
    this.signalArray = [];

    this.lastCross = null;
    this.CROSS_HIGH = 1;
    this.CROSS_LOW = -1;

    //Assimila um novo preco > executa algoritmo > emite sinal
    this.indicatorSignal = function (price, callback){
        this.prices.push(price);
        if(this.prices.length > trendPeriod) {
            this.prices.shift();
        }
        
        let signalAverage;
        if(this.prices.length >= signalPeriod) {
            const signalPrices = this.prices.slice(this.prices.length - signalPeriod); //
            signalAverage = this.calcAverage(signalPrices); //sinal
            this.signalArray.push(signalAverage);
            if(this.signalArray.length > trendPeriod) {
                this.signalArray.shift();
            }
        } else {
            this.signalArray.push(null);
        }

        let trendAverage;
        if (this.prices.length < trendPeriod){ //nao ha valores suficientes?
            this.trendArray.push(null);
            if (this.trendArray.length > trendPeriod){
                this.trendArray.shift();
            }
            return callback(null); //nenhum sinal
        }

        //calcula medias
        trendAverage = this.calcAverage(this.prices); //tendencia, tem a media de todods os pre;os
        

        this.trendArray.push(trendAverage);
        if (this.trendArray.length > trendPeriod){
            this.trendArray.shift();
        }

        //console.log(`${JSON.stringify(this.prices)} - ${JSON.stringify(signalPrices)}`);
        //console.log(`${trendAverage} - ${signalAverage}`);

        if (trendAverage == signalAverage){
            return callback(null); //nenhum sinal
        }else{
            const cross = (signalAverage > trendAverage) ? this.CROSS_HIGH:this.CROSS_LOW;
            if (this.lastCross && this.lastCross != cross){
                this.lastCross = cross;
                const signal = (cross == this.CROSS_HIGH) ? process.env.SIGNAL_BUY:process.env.SIGNAL_SELL; //1 = buy and -1 = sell
                return this.createChart(function (chartData){
                    callback ({
                        signal: signal, //compra ou venda
                        price: price, //ultimo preco, preco que disparou o sinal
                        chartData: chartData
                    });
                });
            }else{
                this.lastCross = cross;
                return callback(null);
            }
        }
    }
    
    this.calcAverage = function (arr) {
        let sum = 0;
        arr.forEach(e => {
            sum += e;
        });
        return sum/arr.length;
    }

    this.clearData = function () {
        this.prices = [];
        this.trendArray = [];
        this.signalArray = [];
        this.lastCross = null;
    }

    this.createChart = function (callback) {
        if(!process.env.CHART_ENABLED || process.env.CHART_ENABLED == "false") {
            return callback(null);
        }

        const self = this;
        const ChartjsNode = require('chartjs-node');
        const chartNode = new ChartjsNode(600, 600);
        
        const labels = [];
        for (let i = 0; i < self.prices.length; i++){
            labels.push(`t${i}`);
        }
        
        return chartNode.drawChart({
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Price",
                        borderColor: 'rgb(255, 255, 0)',
                        data: self.prices,
                    }, 
                    {
                        label: "Trend",
                        borderColor: 'rgb(0, 255, 0)',
                        data: self.trendArray,
                    },
                    {
                        label: "Signal",
                        borderColor: 'rgb(0, 255, 255)',
                        data: self.signalArray,
                    }
                ]
            }, 
            options: {
    
            }
        })
        // CALL JUST AFTER WHEN THE DRAW WAS FINISHED
        .then(buffer => {
            return chartNode.getImageStream('image/png');
        })
        .then((stream) => {
            return chartNode.writeImageToFile('image/png', './testimage.png');
        })
        .then(() => {
            chartNode.destroy(); //memory save 
            const chartData = fs.readFileSync('./testimage.png');
            fs.unlinkSync('./testimage.png');
            callback(chartData);
        });    
    }
}

module.exports = SimpleMovingAverage;
