const args = process.argv.slice(2);
console.log('Running', args[0]);

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

} else {
    console.error('Please specify what you want to run. Expected `server`, `client` or `dev` as parameter, but got', args[0]);
}
