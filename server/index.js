'use strict';

const express = require('express');
const zip = require('express-easy-zip');
const fs = require('fs');

const app = express();
app.use(zip());
const server = require('http').Server(app);

const io = require('socket.io')(server);
const watch = require('node-watch');

io.on('connect', (params) => console.log(params.handshake.address, 'connected at', params.handshake.time));
io.on('disconnect', (params) => console.log(params.handshake.address, 'connected at', params.handshake.time));

app.get('/download/:id', (req,res) => {
    const id = req.params.id;

    if (!fs.existsSync(`./deployment/${id}`)) {
        return res.status(404).send('not found');
    } else {
        return res.zip({files: [{path: `./deployment/${id}/`, name: id}]});
    }
});

module.exports = {
    start: () => {
        if (!fs.existsSync('./deployment/')) {
            console.info('Creating deployment folder');
            fs.mkdirSync('./deployment/');
        }

        io.emit('start', {for: 'everyone'});
        console.info('Listening on port 8080.');
        watch('./deployment', {recursive:true},(...params) => {
            console.info('Change detected, broadcasting', params);
            let path = params[1];
            const id = /deployment\/([a-z0-9]+)\/.*/.exec(path)[1];
            io.emit('changed', {for: 'everyone', id});
        });
        server.listen(8080);
    },
    stop: () => {

    }
};
