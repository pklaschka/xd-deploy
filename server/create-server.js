/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const selfSigned = require('selfsigned');

/**
 * Creates a server for http or httpss usage
 * @param {import('http').RequestListener} app The express app that gets used
 * @param {boolean} useHTTPs use HTTPS with a self-signed ceritificate?
 * @returns {import('http').Server | import('https').Server}
 */
module.exports = function createServer(app, useHTTPs) {
    if (useHTTPs) {
        console.log('Creating SSL certificates');
        const certs = selfSigned.generate([
                {name: 'commonName', value: 'xd-deploy'}
            ],
            {
                days: 2
            });
        return require('https').createServer({
            key: certs.private,
            cert: certs.cert,
            rejectUnauthorized: false,
            requestCert: false
        }, app);
    } else {
        return require('http').createServer(app);
    }
};
