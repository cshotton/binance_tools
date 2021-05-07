# btd_test_bot transaction parser

This application is designed to iterate over a folder of JSON files and read transaction records 
output and saved by Rebar trading bots and extract relevant info into a CSV formatted output.

It is intended to be run with the associated shell script *btools.sh* and receive 3 arguments:

    ./btools.sh APIKEY APISECRET /path/to/folder/*.json > output.csv

This will read all of the files in a folder, parsing them to determine if they contain the expected
data, and then printing a single line to stdout.
