/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const socketIO = require('socket.io');
const _ = require('lodash');

/**
 * The socket server
 * @type {undefined | import('socket.io').Server}
 */
let io;

/**
 * Starts the socket server
 * @param {import('http').Server} server The HTTP/S server
 * @returns {void}
 * @throws {Error} when the server is already running
 */
function startSocketServer(server) {
    if (io)
        throw new Error('Socket server is already running');
    io = socketIO(server);

    /**
     * Logs an event to the console
     * @param {import('socket.io').Socket} socket
     * @param {'connected'|'disconnected'} event
     */
    function logConnected(socket, event) {
        console.log(socket.handshake.address, event, 'at', socket.handshake.time);
    }

    io.on('connect',
        /**
         * @param {import('socket.io').Socket} socket
         */
        socket => logConnected(socket, 'connected'));
    io.on('disconnect',
        /**
         * @param {import('socket.io').Socket} socket
         */
        socket => logConnected(socket, 'disconnected'));

    io.emit('start', {for: 'everyone'});
}

/**
 * Broadcast a change to a plugin
 * @type function
 * @param {string} path
 * @returns {void}
 * @throws {Error} when called while the server isn't running
 */
const broadcast = _.debounce((path) => {
    if (!io)
        throw new Error('Socket server not running');

    const idMatch = /deployment\/([a-z0-9]+)\/?$/.exec(path);

    if (!idMatch || idMatch.length < 2)
        throw new Error('No id found in changed path');

    const id = idMatch[1];

    const {emit} = io;
    if (/deployment\/[a-z0-9]+$/.test(path)) {
        console.info('Change detected, broadcasting');
        emit('changed', {for: 'everyone', id});
    } else {
        console.info('Change detected, broadcasting');
        emit('changed', {for: 'everyone', id});
    }
}, 2000);

/**
 * Stop the socket server, if it's running
 * @returns {void}
 */
function stopSocketServer() {
    if (io)
        io.close();
    io = undefined;
}

module.exports = {startSocketServer, stopSocketServer, broadcast};
