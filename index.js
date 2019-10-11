const args = process.argv.slice(2);
console.log('Running', args[0]);

if (args[0] === 'server') {
    require('./server').start();
} else if (args[0] === 'client') {
    require('./client').start();

} else if (args[0] === 'dev') {

} else {
    console.error('Please specify what you want to run. Expected `server`, `client` or `dev` as parameter, but got', args[0]);
}
