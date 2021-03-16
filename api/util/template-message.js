

const templateMessage = async (myBetsOpen) => {
    try {
        let message = 'Olá! segue apostas feitas:\n\r '
        message += myBetsOpen.map((bet, index) => (
        `Aposta ${index + 1}:
        Time Casa: ${bet.timeCasa}
        Time Visitante: ${bet.timeVisitante}
        Data Jogo: ${bet.dataJogo}
        Hora Jogo: ${bet.horaJogo}
        Valor Aposta: ${bet.valorAposta}
        Data aposta: ${bet.data}
        Hora aposta: ${bet.hora}
        APOSTA: ${bet.statusAposta} : ${bet.time}
        Odd: ${bet.odd}
        \n\r`))

        return message
    } catch (error) {
        console.log('erro ao montar mensagem', error)
        return null
    }
}

module.exports = {
    templateMessage
}