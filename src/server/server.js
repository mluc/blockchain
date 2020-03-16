import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

var indexToStatusCode = {
    0: STATUS_CODE_UNKNOWN,
    1: STATUS_CODE_ON_TIME,
    2:STATUS_CODE_LATE_AIRLINE,
    3:STATUS_CODE_LATE_WEATHER,
    4:STATUS_CODE_LATE_TECHNICAL,
    5:STATUS_CODE_LATE_OTHER,
};

var statusCodeToString = {
    0: 'UNKNOWN',
    10: 'ON TIME',
    20: 'LATE AIRLINE',
    30: 'LATE WEATHER',
    40: 'LATE TECHNICAL',
    50: 'LATE OTHER',
};


let ORACLES_COUNT=35;
const Oracle = {
  register:async function(){
      try {
          const accounts = await web3.eth.getAccounts();
          let fee = await flightSuretyApp.methods.getRegistrationFee().call();
          console.log('********************* Oracle Registered *******************')

          for(let a=11; a<ORACLES_COUNT+11; a++) {
              await flightSuretyApp.methods.registerOracle().send({ from: accounts[a], value: fee , gas:500000000});
              let result = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]});
            console.log(`${accounts[a]} Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
        }

      }catch (e) {
          console.error('Error while registering oracles:', e)
      }

  },

  submitResponse:async function(index, airline, flight, timestamp){
      const accounts = await web3.eth.getAccounts();

      for(let a=11; a<ORACLES_COUNT+11; a++) {

          // Get oracle information
          let oracleIndexes = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]});
          //console.log(`oracleIndexes ${accounts[a]} Oracle Registered: ${oracleIndexes[0]}, ${oracleIndexes[1]}, ${oracleIndexes[2]}`);

          for(let idx=0;idx<3;idx++) {

              try {
                  let rand = Math.floor(Math.random() * Math.floor(6));
                  let randomStatusCode = indexToStatusCode[rand];

                  // Submit a response...it will only be accepted if there is an Index match
                  var result = await flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx], airline, flight, timestamp, randomStatusCode).send({ from: accounts[a],gas:500000000 });
                  let returnedAirline = result.events['FlightStatusInfo']['returnValues']['airline'];
                    let returnedFlight = result.events['FlightStatusInfo']['returnValues']['flight'];
                    let returnedTimestamp = Number(result.events['FlightStatusInfo']['returnValues']['timestamp']);
                    let returnedStatus = Number(result.events['FlightStatusInfo']['returnValues']['status']);
                    let statusString = statusCodeToString[returnedStatus];
                    let returnedVerified = result.events['FlightStatusInfo']['returnValues']['verified'];
                  console.log(`\n\nFlight Status Available: airline: ${returnedAirline} flight: ${returnedFlight}, timestamp: ${returnedTimestamp}, status: ${statusString}, verified: ${returnedVerified ? 'VERIFIED' : 'UNVERIFIED'}`);

                  // Check to see if flight status is available
                  // Only useful while debugging since flight status is not hydrated until a
                  // required threshold of oracles submit a response
                  //let flightStatus = await config.exerciseC6D.viewFlightStatus(flight, timestamp);
                  //console.log('\nPost', idx, oracleIndexes[idx].toNumber(), flight, timestamp, flightStatus);
              }
              catch(er) {
                  // Enable this when debugging
                  if(!er.message.includes('Flight or timestamp do not match oracle request') && !er.message.includes('Index does not match oracle request')){
                      throw er;
                  }
              }
          }
      }

  }
};

Oracle.register();


flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    console.log('********************* OracleRequest event was emitted *******************');
    if (error){
        console.error('Error from server.js OracleRequest', error)
    } else {
        let index = event.returnValues['index'];
        let airline = event.returnValues['airline'];
        let flight = event.returnValues['flight'];
        let timestamp = event.returnValues['timestamp'];
        console.log(`Index: ${index} Airline:${airline} Flight: ${flight} Timestamp: ${timestamp}`)


        Oracle.submitResponse(index, airline, flight,timestamp);


    }

});

const app = express();
app.get('/', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

// TODO: ^add endpoints to return list of hardcoded flights and add drop down to UI

export default app;


