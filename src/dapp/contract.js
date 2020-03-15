import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {

    constructor(network, callback) {

        let config = Config[network];
        console.log('GGGGGGG', config);
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData= new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flightSuretyAppAddress = config.appAddress;
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }


    authorizeContract(callback) {
        let self = this;
        self.flightSuretyData.methods
            .authorizeContract(self.flightSuretyAppAddress)
            .send({ from: self.owner}, callback);
    }

    // testing(callback) {
    //     let self = this;
    //     console.log('HHHHHH owner ', this.owner);
    //     self.flightSuretyData.methods
    //         .testing()
    //         .call({ from: self.owner}, callback);
    // }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    registerAirline(airlineAddress, callerAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress
        }
        self.flightSuretyApp.methods
            .registerAirline(payload.airlineAddress)
            .send({ from: callerAddress}, (error, result) => {
                callback(error, payload);
            });
    }//airlineFund

    airlineFund(callerAddress, amount, callback) {
        console.log('HHHHHHHHHHH ', callerAddress);
        let self = this;
        self.flightSuretyApp.methods
            .airlineFund()
            .send({ from: callerAddress, value:amount*1000000000000000000}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}