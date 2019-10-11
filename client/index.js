const io = require('socket.io-client');
module.exports = {
    start: () => {
        const client = io.connect('http://localhost:8081');
        client.on('connect', () => { console.log('connected' )});

        client.on('changed', (params) => {
            console.log(params);
        })

    }
};
