'use strict';

const express = require('express');
const zip = require('express-zip');
const fs = require('fs');
const io = require('socket.io')(8081);
const watch = require('node-watch');

io.on('connect', (params) => console.log(params.handshake.address, 'connected at', params.handshake.time));
io.on('disconnect', (params) => console.log(params.handshake.address, 'connected at', params.handshake.time));

const app = express();
app.get('/download/:id', (req,res) => {
    const id = req.params.id;

    if (!fs.existsSync(`./deployment/${id}`)) {
        return res.status(404).send('not found');
    } else {
        return res.zip([{path: `./deployment/${id}`, name: id}]);
    }

});

module.exports = {
    start: () => {
        if (!fs.existsSync('./deployment/')) {
            console.info('Creating deployment folder');
            fs.mkdirSync('./deployment/');
        }

        io.emit('start', {for: 'everyone'});
        console.info('Listening on port 8080. Socket server available on port 8081.')
        watch('./deployment', {recursive:true},(...params) => {
            console.info('Change detected, broadcasting', params);
            let path = params[1];
            const id = /deployment\/([a-z0-9]+)\/.*/.exec(path)[1];
            io.emit('changed', {for: 'everyone', id});
        });
        app.listen(8080);
    },
    stop: () => {

    }
}
