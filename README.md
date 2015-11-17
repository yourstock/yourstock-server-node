# nodejs server of yourstock

## How to install (On ubuntu 14.04)

### Install latest `Node.js`
Add `Node.js` repository
```
$ curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

### Install prerequisites
```
$ sudo npm install -g node-gyp
$ sudo npm install -g forever
$ sudo apt-get install libkrb5-dev
$ cd yourstock-server-node
$ npm install
```

### Install `mongodb`
```
$ sudo apt-get install mongodb
```


## Crawl stock data
We need to implement direct cli but currently commends should run on `node` console
```
$ node
> crawler = require('./crawler.js')
> crawler.getcodes()
> crawler.getyearvalues()
> crawler.calclulateminmax()
```

## Run app server
```
$ cd yourstock-server-node
$ forever start app.js
```

## APIs
Currently everything is serviced on port `3000`
### Retrieve all Company names and codes
`http://hostname:3000/codes`

### Retrieve one company's data for a range
`http://hostname:3000/history?code=[standard_code]&range=[date_from_today]`

This returns everyday's price and min/max price for specified date range


### Retrieve every company's min/max price for a year/month/week
`http://45.32.18.89:3000/history_all`
