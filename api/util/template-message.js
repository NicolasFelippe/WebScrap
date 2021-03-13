

const templateMessage = async (myBeatsOpen) => {
    try {
        let message = 'Olá! segue apostas feitas:\n\r '
        message += myBeatsOpen.map((beat, index) => (
        `Aposta ${index + 1}:
        Time Casa: ${beat.timeCasa},
        Time Visitante: ${beat.timeVisitante},
        Data Jogo: ${beat.dataJogo},
        Hora Jogo: ${beat.horaJogo},
        Valor Aposta: ${beat.valorAposta},
        Data: ${beat.data},
        Hora: ${beat.hora}
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