/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

'use strict';

const bodyParser = require('body-parser');

const express = require('express');
const zip = require('express-easy-zip');
const extract = require('extract-zip');
const fs = require('fs');
const path = require('path');
const rrmdir = require('../lib/rmdir');
const createServer = require('./create-server');

const app = express();
app.use(zip());

const {broadcast, startSocketServer} = require('./socket-server');

const deploymentFolder = require('path').join(require('../lib/xd-deploy-folder'), 'server');

console.log(deploymentFolder);

/**
 * Route for downloading the plugin with the specified id
 * @name /download/:id
 * @param {string} id The id of the plugin that gets downloaded
 * @returns HTTP-200 The zip of the plugin, if available
 * @throws 404 if the plugin isn't available
 * @function
 */
app.get('/download/:id', (req, res) => {
    const id = req.params.id;

    if (!fs.existsSync(`${deploymentFolder}/${id}`)) {
        return res.status(404).send('not found');
    } else {
        // @ts-ignore
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

    // Extract zip
    extract(zipLocation, {dir: path.join(deploymentFolder, id)}, (error) => {
        if (error) {
            throw error;
        }
        fs.unlinkSync(zipLocation);
        broadcast(id);
        return res.json({status: 'ok'});
    });
});

app.get('/', (_req, res) => {
    return res.status(204).send();
});

app.get('/plugins', (_req, res) => {
    return res.json(fs.readdirSync(deploymentFolder));
});

/**
 *
 * @param {number} port The port on which the server should run
 * @param {boolean} useHTTPs
 */
module.exports = (port, useHTTPs) => {
    const server = createServer(app, useHTTPs);
    if (!fs.existsSync(deploymentFolder)) {
        console.info('Creating deployment folder');
        fs.mkdirSync(deploymentFolder);
    }

    startSocketServer(server);
    console.info(`Listening on port ${port}.`);

    server.listen(port);
};
