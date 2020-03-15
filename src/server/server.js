import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    console.log('In server.js OracleRequest');
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

// TODO: ^add endpoints to return list of hardcoded flights and add drop down to UI

export default app;


