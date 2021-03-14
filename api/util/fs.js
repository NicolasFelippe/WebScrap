const fs = require('fs');
const dotenv = require('dotenv').config()

const writeFile = (html, type) => {
    const date = new Date()
    const dateString = date.getTime()
    const path = `C:\\temp\\${dateString}.${type}`
    fs.writeFile(path, html, function (error) {

        if (error) {
            console.log('erro ao escrever arquivo', error)
            return null
        }

        console.log("Arquivo salvo no caminho: " + path);
    });

    return path

}

const writeFileModel = (data) => {
    if(dotenv.error){
        console.log('Erro ao pegar caminho do modelo apostas.json')
        return
    }
    fs.appendFile(dotenv.parsed.PATHMODEL, `${JSON.stringify(data)},\n`, (error) => console.log(error || 'Modelo escrito com sucesso'))
}

const readFile = async (path) => {
    let html = null
    fs.readFileSync(path, 'utf-8', function (error, data) {

        if (error) {
            console.log('erro ao ler arquivo', error)
            return null
        }
        console.log('data', data)
        html = data
    });

    return html

}
const removeFile = (path) => {
    try {
        fs.unlinkSync(path)   
    } catch (error) {
        console.log('Erro ao apagar arquivo', error)
        return null
    }
}

module.exports = {
    writeFile,
    readFile,
    removeFile,
    writeFileModel
}