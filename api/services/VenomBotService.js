const venom = require('venom-bot');

class VenomBotService {

    constructor() {

    }

  create () {
      try {
          venom
          .create()
          .then((client) => start(client));
      } catch (error) {
        console.log('bot whats', error)
      }
  }

 start(client) {
  client.onMessage((message) => {
    if (message.body === 'Oi' || message.body === 'Olá') {
      client
        .sendText(message.from, 'Olá! Tudo bem com você?')
        .then((result) => {
          console.log('Result: ', result); //retorna um objeto de successo
        })
        .catch((erro) => {
          console.error('Erro ao enviar mensagem: ', erro); //return um objeto de erro
        });
    }
  });
}
}
module.exports = VenomBotService;