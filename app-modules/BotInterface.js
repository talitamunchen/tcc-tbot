const TelegramBot = require('node-telegram-bot-api');

const BotInterface = function (orchestrator){
    this.orchestrator = orchestrator;
    this.token = process.env.BOT_API_TOKEN;

    this.bot = new TelegramBot(this.token, {polling: true});
    this.chatId = null; // Será preenchido assim que o usuário conectar

    // Matches "/echo [whatever]"
    this.bot.onText(/\/start.*/, (msg, match) => {
        this.chatId = msg.chat.id;
        this.bot.sendMessage(this.chatId, "Bot connected!");
        this.orchestrator.botConnected();
    });

    this.bot.onText(/\/cancel.*/, (msg, match) => {
        this.chatId = msg.chat.id;
        this.bot.sendMessage(this.chatId, "Cancelling all pending orders!");
        this.orchestrator.cancelAllOrders();
    });

    this.bot.onText(/\/balance.*/, (msg, match) => {
        this.orchestrator.requestBalance();
    });
  
    this.sendRequestOrder = function(orderData) {
        this.orderData = orderData;
        const opts = {
            reply_markup: {
                inline_keyboard: [[{text: 'Do it!', callback_data: 'yes'}, {text: 'No, thanks!', callback_data: 'no'}]],
                resize_keyboard: true
            }, parse_mode: 'Markdown'
        };
        const signal = orderData.signal < 0 ? 'SELL':'BUY';
        const message = `Hi, there is an opportunity for *${signal}*\nCoin: ${orderData.coinPair}\nAmount: ${orderData.quantity}\nPrice: R$ ${(orderData.limitPrice).toFixed(2)}\nTotal: R$ ${(orderData.quantity*orderData.limitPrice).toFixed(2)}`; 
        this.bot.sendMessage(this.chatId, message, opts);
    }

    this.bot.on('callback_query', (query) => {
        const action = query.data;
        const msg = query.message;
        if (query.data == 'yes'){
            this.bot.sendMessage(this.chatId, 'Sending order...');
            this.orchestrator.orderCallback(this.orderData);
        }else{
            this.bot.sendMessage(this.chatId, 'Order discarted!');
            this.orchestrator.orderCallback(null);
        }
        this.orderData = null;
    });

    this.sendGenericMessage = function (msg) {
        this.bot.sendMessage(this.chatId, msg, {
            parse_mode: 'Markdown'
        });
    }
}


module.exports = BotInterface;