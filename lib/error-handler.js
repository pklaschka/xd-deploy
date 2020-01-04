/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

let verbose = false;

/**
 * Enable/Disable verbose error logging
 * @param {boolean} log_verbose
 */
function setVerbose(log_verbose) {
    verbose = log_verbose;
}

/**
 * Log to console
 * @param {...*} args
 */
function log(...args) {
    console.log(...args)
}

/**
 * Log an error to the console
 * @param {Error} e
 */
function error(e) {
    console.error(e.message);

    if (verbose) {
        console.error(e.name);
        console.error(e.stack);
    }
}

/**
 * Log error to console and exit with status code 1
 * @param {Error} e
 */
function fatal(e) {
    error(e);
    process.exit(1);
}

module.exports = {log, error, fatal, setVerbose};
