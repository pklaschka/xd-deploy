#! /usr/bin/env node

/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const program = require('commander');
const packageJSON = require('./package.json');

program
    .name('xd-deploy')
    .version(packageJSON.version)
    .action(() => {
        console.error('No valid command specified.');
        program.outputHelp();
        process.exit(1);
    });

program
    .command('server')
    .description('start the server providing a bridge between clients and dev-client')
    .option('-p, --port [port]', 'Which port to use', parseFloat, 8080)
    .option('-s, --https', 'Use https. The server then generates self-signed certificates and uses them for communication')
    .option('-d, --debug', 'enable verbose debugging output')
    .action(async (options) => {
        try {
            const server = require('./server');
            await server(options.port, options.https);
        } catch (e) {
            console.error(e.message);
            if (options.debug) {
                console.error(e.stack);
            }
            process.exit(1);
        }
    });

program
    .command('develop <action> <serverLocation> [directory]')
    .description('Submit the plugin to the server', {
        action: '"watch" or "install". With "install" the plugin gets deployed once, with "watch" the plugin folder gets watched for changes.',
        serverLocation: 'The server url of the server started via "xd-deploy server',
        directory: 'The plugin directory. The current working directory by default'
    })
    .usage('<action> <serverLocation> [directory]')
    .alias('dev')
    .option('-d, --debug', 'enable verbose debugging output')
    .action(async (action, serverLocation, directory, options) => {
        try {
            const devClient = require('./dev-client');
            await devClient(action, serverLocation, directory || '.');
        } catch (e) {
            console.error(e.message);
            if (options.debug) {
                console.error(e.stack);
            }
            process.exit(1);
        }
    });

program.command('client <serverLocation>')
    .description('starts a client on a machine that has XD installed and installs all plugins, connects to the specified server, and updates them when possible.', {
        serverLocation: 'The url of the server started with "xd-deploy server"'
    })
    .option('-d, --debug', 'enable verbose debugging output')
    .action(async (serverLocation, options) => {
        try {
            const client = require('./client');
            await client(serverLocation);
        } catch (e) {
            console.error(e.message);
            if (options.debug) {
                console.error(e.stack);
            }
            process.exit(1);
        }
    });

program.parse(process.argv);

const noCommandSpecified = process.argv.length < 3;
if (noCommandSpecified) program.help();
