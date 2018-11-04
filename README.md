# tcc-talita

**Criando um bot no telegram (utilizando o BotFather)**

1.  abra uma conversa com *BotFather*
    
2.  use o comando **/newbot** para criar um novo bot
    
3.  siga as instruções para criar um novo bot
    
4.  abra o seu bot
    
**Instalando e iniciando a aplicação**

1.  git clone
    
2.  npm install
    
3.  cp .en.example .env
    
4.  altere o arquivo .env
    
5.  node **index.js**
    
6.  abra o telegram e use **/start** para conectar o bot com a aplicação
    
7.  aguarde os sinais

**Comandos do bot**

- **/start**: inicia a aplicação
    
- **/cancel**: cancela todas as ordens pendentes
    
- **/balance**: retornar informações de conta
- botão "**Do it!**": realiza a operação apresentada ao usuário
- botão "**No, thanks!**": cancela a operação apresentada ao usuário

**Variáveis de ambiente**

 - *GATEWAY_TICKER_UPDATE_INTERVAL*: tempo para pegar dados atualizados de mercado
 - *GATEWAY_REQUEST_PRICE_TIMEOUT*: retorna um timeout caso demore mais do que o normal para uma atualização de mercado
 - *TAPI_URL*: url da corretora
 - *TAPI_SECRET*: api de transação
 - *TAPI_KEY*: chave de transação
 - *RETRY_TIMEOUT*: tempo setado para tentar executar novamente caso uma transação de erro ou timeout
 - *COIN*: moeda que o usuário deseja realizar às operações
 - *SIGNAL_BUY*: sinal de compra
 - *SIGNAL_SELL*: sinal de venda
 - *TREND_PERIOD*: período de tendência, intervalo de dado para cálculo de linha de tendência
 - *SIGNAL_PERIOD*: período de sinal, intervalo de dado para cálculo de linha de sinal
 - *SELL_SPREAD_MARGIN*: Multiplicador do preço de sinal para definir o preço de execução
 - *BUY_SPREAD_MARGIN*: multiplicador do preço de sinal para definir o preço de execução
 - *SELL_AMOUNT*: porcentagem sobre o valor total disponível, fazendo com que o usuário tenha a possibilidade de definir se uma ordem seja executada sobre todo o valor disponível na sua conta.
 - *BUY_AMOUNT*: porcentagem sobre o valor total disponível, fazendo com que o usuário tenha a possibilidade de definir se uma ordem seja executada sobre todo o valor disponível na sua conta.
 - *BOT_API_TOKEN*: token necessário para fazer comunicação com o bot.
 - *ORDER_MONITOR_INTERVAL*: Intervalo setado para fazer o monitoramento de ordem
 - *ORDER_MONITOR_TIMEOUT*: tempo de timeout setado para cancelamento de ordem caso aconteça algum erro durante o processo
 - *MIN_BRL_BALANCE_TO_BUY*: minimo permitido para compra
 - *MIN_COIN_BALANCE_TO_SELL*: minimo permitido de criptomoedas para venda