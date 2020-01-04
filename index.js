#! /usr/bin/env node

/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const program = require('commander');
const packageJSON = require('./package.json');
const {log} = require("./lib/error-handler");
const {fatal} = require("./lib/error-handler");
const {setVerbose} = require("./lib/error-handler");

program
    .name('xd-deploy')
    .version(packageJSON.version)
    .action(() => {
        program.outputHelp();
        log();
        fatal(new Error('No valid command specified.'));
    });

program
    .command('server')
    .description('start the server providing a bridge between clients and dev-client')
    .option('-p, --port [port]', 'Which port to use', parseFloat, 8080)
    .option('-s, --https', 'Use https. The server then generates self-signed certificates and uses them for communication')
    .option('-d, --debug', 'enable verbose debugging output')
    .action(
        /**
         *
         * @param {{https: boolean, port: number, debug: boolean}} options
         * @returns {Promise<void>}
         */
        async (options) => {
            setVerbose(options.debug);
            try {
                const server = require('./server');
                await server(options.port, options.https);
            } catch (e) {
                fatal(e);
            }
        }
    );

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
        setVerbose(options.debug);
        try {
            const devClient = require('./dev-client');
            await devClient(action, serverLocation, directory || '.');
        } catch (e) {
            fatal(e);
        }
    });

program.command('client <serverLocation>')
    .description('starts a client on a machine that has XD installed and installs all plugins, connects to the specified server, and updates them when possible.', {
        serverLocation: 'The url of the server started with "xd-deploy server"'
    })
    .option('-d, --debug', 'enable verbose debugging output')
    .action(async (serverLocation, options) => {
        setVerbose(options.debug);
        try {
            const client = require('./client');
            await client(serverLocation);
        } catch (e) {
            fatal(e);
        }
    });

program.parse(process.argv);

const noCommandSpecified = process.argv.length < 3;
if (noCommandSpecified) program.help();
