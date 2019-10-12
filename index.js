#! /usr/bin/env node

const args = process.argv.slice(2);
console.log('Running', args[0]);

try {
    if (args[0] === 'server') {
        require('./server').start();
    } else if (args[0] === 'client') {
        if (!args[1]) {
            console.error('Please specify the server location.');
            console.log('xd-deploy client (server-location)');
            console.log('e.g., xd-deploy client http://localhost:8080');
        } else {
            require('./client').start(args[1]);
        }
    } else if (args[0] === 'dev') {
        if (!args[1] || !args[2]) {
            console.error('Please specify the server location.');
            console.log('xd-deploy dev (action) (server-location) [folder]');
            console.log('e.g., xd-deploy dev watch http://localhost:8080 .');
        } else {
            if (args[3])
                require('./dev-client')(args[1], args[2], args[3]);
            else
                require('./dev-client')(args[1], args[2]);
        }
    } else {
        console.error('Please specify what you want to run. Expected `server`, `client` or `dev` as parameter, but got', args[0]);
    }
} catch (e) {
    console.error('Error: ', e.message);
    if (args.includes('--debug') || args.includes('-d')) {
        console.log(e.stack)
    }
}
