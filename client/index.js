const io = require('socket.io-client');
const axios = require('axios');
const fs = require('fs');
const extract = require('extract-zip');
const path = require('path');

const zipLocation = path.join(__dirname, './current.zip');

const home = require('os').homedir();

const locations = {
    win: path.join(home, 'AppData', 'Local', 'Packages', 'Adobe.CC.XD_adky2gkssdxte', 'LocalState'),
    mac: path.join(home, 'Library', 'Application Support', 'Adobe', 'Adobe XD'),
    linux: '/home/pklaschka/Desktop/xd-plugins-emulated',
};

const xdPluginFolderLocation = locations[require('os').platform()]; // TODO: Dynamic platform

module.exports = {
    start: (serverLocation) => {
        const client = io.connect(serverLocation);
        client.on('connect', () => {
            console.log('connected')
        });

        client.on('changed', async (params) => {
            console.log('Updating plugin with id', params.id);
            // download zip
            console.log('\tDownloading plugin');

            if (fs.existsSync(zipLocation))
                fs.unlinkSync(zipLocation);

            const writer = fs.createWriteStream(zipLocation);

            const zip = await axios.get(`${serverLocation}/download/${params.id}`, {
                responseType: 'stream'
            });
            console.log(`\tDownload complete. Extracting to ${xdPluginFolderLocation}`);
            writer.on('finish', () => {
                // Extract zip file

                if (!fs.existsSync(xdPluginFolderLocation)) {
                    throw new Error('Adobe XD Plugins directory does not exist. Expected ' + xdPluginFolderLocation + ' to exist.');
                } else {
                    extract(zipLocation, {dir: xdPluginFolderLocation}, () => {
                        console.log('\tExtraction completed.');
                    });
                }
            });
            zip.data.pipe(writer);
        })

    }
};
