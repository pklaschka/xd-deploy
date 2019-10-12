'use strict';

const bodyParser = require('body-parser');

const express = require('express');
const zip = require('express-easy-zip');
const extract = require('extract-zip');
const fs = require('fs');
const path = require('path');
const rrmdir = require('../lib/rmdir');
const _ = require('lodash');

const app = express();
app.use(zip());
// noinspection JSValidateTypes
const server = require('http').Server(app);

const io = require('socket.io')(server);
const chokidar = require('chokidar');

const deploymentFolder = require('path').join(__dirname, '../deployment');

io.on('connect', (params) => console.log(params.handshake.address, 'connected at', params.handshake.time));
io.on('disconnect', (params) => console.log(params.handshake.address, 'connected at', params.handshake.time));

app.get('/download/:id', (req, res) => {
    const id = req.params.id;

    if (!fs.existsSync(`${deploymentFolder}/${id}`)) {
        return res.status(404).send('not found');
    } else {
        return res.zip({files: [{path: `${deploymentFolder}/${id}/`, name: id}]});
    }
});

app.use(bodyParser.raw(
    {
        type: 'application/zip',
        limit: '10mb'
    }
));

app.post('/post/:id', async (req, res) => {
    const id = req.params.id;
    const zipLocation = path.join(deploymentFolder, id + '.zip');

    if (fs.existsSync(path.join(deploymentFolder, id)))
        await rrmdir(path.join(deploymentFolder, id));

    console.info('Receiving update for', id);
    fs.writeFileSync(zipLocation, req.body);

    console.log(zipLocation, deploymentFolder);

    // Extract zip
    extract(zipLocation, {dir: path.join(deploymentFolder, id)}, () => {
        fs.unlinkSync(zipLocation);
        // io.emit('changed', {for: 'everyone', id});
        return res.json({status: 'ok'});
    });
});

app.get('/', (req, res) => {
    return res.status(204).send();
});

app.get('/plugins', (req, res) => {
    return res.json(fs.readdirSync(deploymentFolder));
});

module.exports = {
    start: () => {
        if (!fs.existsSync(deploymentFolder)) {
            console.info('Creating deployment folder');
            fs.mkdirSync(deploymentFolder);
        }

        io.emit('start', {for: 'everyone'});
        console.info('Listening on port 8080.');

        const broadcast = _.debounce((path) => {
            if (/deployment\/[a-z0-9]+$/.test(path)) {
                console.info('Change detected, broadcasting', path);
                const id = /deployment\/([a-z0-9]+)\/?$/.exec(path)[1];
                io.emit('changed', {for: 'everyone', id});
            } else {
                console.info('Change detected, broadcasting', path);
                const id = /deployment\/([a-z0-9]+)\/.*$/.exec(path)[1];
                io.emit('changed', {for: 'everyone', id});
            }
        }, 2000);

        const watcher = chokidar.watch(deploymentFolder, {
            persistent: true
        });

        const onUpdate = (path) => {
            if (/deployment\/[a-z0-9]+\/.*$/.test(path)) {
                broadcast(path);
            }
        };

        watcher.on('add', path => onUpdate(path));
        watcher.on('change', path => onUpdate(path));
        watcher.on('unlink', path => onUpdate(path));

        server.listen(8080);
    }
};
