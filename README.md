## Installation

```
$ npm install
```
```
$ ./node_modules/.bin/selenium-standalone install
```

## Getting Started

Run Selenium with:
```
$ npm run selenium
```
Then launch the script with:
```
$ npm start
```

## Set up a Cron job

Edit your crontab files by running:
```
$ crontab -e
```
Then add the following line:
```
00 08 * * 1-5 cd <PATH>/downtheshit && utils/run_all.sh
```
**Note**: make sure to use the right path to DTS.