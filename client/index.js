/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const io = require('socket.io-client');
const applyUpdate = require('./apply-update');

/**
 * Starts the client which listens for plugin changes in the server and installs them on the machine
 * @param {string} serverLocation
 */
module.exports = (serverLocation) => {
    return new Promise((_resolve, reject) => {
        const client = io.connect(serverLocation, {secure: true, rejectUnauthorized: false});
        client.on('connect', () => {
            console.log('connected');
        });

        client.on('connect_error', reject);

        client.on('changed',
            /**
             * @param {object} params
             * @param {string} params.id
             * @returns {Promise<void>}
             */
            params => applyUpdate(params, serverLocation)
        );
    });
};
