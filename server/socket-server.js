/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const socketIO = require('socket.io');

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
    console.log('Socket server started');

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
 * @param {string} id
 * @returns {void}
 * @throws {Error} when called while the server isn't running
 */
const broadcast = (id) => {
    if (!io)
        throw new Error('Socket server not running');

    console.info('Broadcasting update for', id);
    io.sockets.emit('changed', {for: 'everyone', id});
};

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
