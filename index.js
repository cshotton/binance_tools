const _ = require('lodash');
const fs = require('fs');
const ccxt = require ('ccxt')  // https://www.npmjs.com/package/ccxt
// https://github.com/ccxt/ccxt/wiki/Manual#querying-orders

/**
 * Load file from a certain path
 * @param  {Object} source - source-specific object or string that is the source containing the file
 * @param  {String} file - name of the file in source
 * @param  {Object} opts - optional arguments to internal functions
 * @return {String}      Contents of file
 */
 function loadFile(source, file, opts) {
    let data = "", path;
    path = source + file; //this is an implementation specific hack that needs to change when source isn't just a directory string
    try {
        data = fs.readFileSync(path, opts);
        return data;
    } catch (err) {
        console.log ("[loadFile] Error: " + printError(err));
        return null;
    }
}

/**
 * Prints out an error whether it is a string or an object
 * @param  {Object | String} error - Error to be reported
 * @return {String}
 */
function printError(error) {
    if (_.isNil(error) ) return "";
    if (!_.isNil(error.toString)) return error.toString();
    let printStr = "";
    try {
        printStr = _.isObject(error) ? safeStringify(error) : ""+error;
    } catch(e){
        printStr = ""+error;
    }

    return printStr;
}

/**
 * return a non-recursive string rep of an object
 * @param  {Object} value
 * @return {String}
 */
 function safeStringify (value) {
	const seen = new Set();
	return JSON.stringify(value, (k, v) => {
		if (seen.has(v)) { return '...' }
		if (typeof v === 'object') { seen.add(v) }
		return v;
	},4);
}

//read command line args
let apiKey = process.argv[2];
let apiSecret = process.argv[3];
let ifname = process.argv[4];

if (process.argv.length<5) {
    console.log ("\nUsage: binance_tools <apiKey> <apiSecret> <inputFileName>\n");
    process.exit ();
}

// read the json input file

let fdata = loadFile ("", ifname, null);

try {

    var xact = JSON.parse (fdata);

    const exchangeId = 'binanceus'
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass ({
            'apiKey': apiKey,
            'secret': apiSecret,
            'timeout': 30000,
            'enableRateLimit': true,
        })

    //fish out the sell orderId from this transaction and look it up if it exists
    if (xact.hasOwnProperty ("sell_response")) {
        let orderId = xact.sell_response.orderId || null;

        // build the ticker symbol in the "standard" form
        let ticker = xact.signal.pair.base + "/" + xact.signal.pair.quote;

        if (orderId) {
            exchange.fetchOrder (orderId, symbol = ticker, params={})
            .then ((order)=>{
    //            console.log (`\nGot order details:\n${JSON.stringify (order, null, 4)}`);
                try {
                    let signal_time = xact.signal.ticks;
                    let ticker_base = xact.signal.pair.base;
                    let ticker_quote = xact.signal.pair.quote;
                    let deviation = xact.signal.deviation;
                    let sellTime = order.info.time;
                    let updateTime = order.info.updateTime;
                    //output the single line of CSV data
                    console.log (`${ifname},${signal_time},${ticker_base},${ticker_quote},${deviation},${sellTime},${updateTime}`);
                }
                catch (err) {
                    console.log (`Error outputing data: ${printError(err)}`);
                }
            })
            .catch ((err)=>{
                console.log (`Error fetching order: ${printError(err)}`)
            })
        }
    }

}
catch (err) {
    console.log (`Error: ${printError(err)}`)
}