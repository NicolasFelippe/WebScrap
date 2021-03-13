const fs = require('fs');


const writeFile = (html) => {
    const date = new Date()
    const dateString = date.getTime()
    const path = `C:\\temp\\meuarquivo${dateString}.html`
    fs.writeFile(path, html, function (error) {

        if (error) {
            console.log('erro ao escrever arquivo', error)
            return null
        }

        console.log("Arquivo salvo no caminho: " + path);
    });

    return path

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
    removeFile
}