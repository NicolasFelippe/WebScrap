const { exec } = require('child_process');



const execute = (command) => { 
    exec(command,{detached: false},(error, stdout, stderr) => {
    if (error) {
    throw error;
    }
    console.log(stdout);
})};    

module.exports = {execute}