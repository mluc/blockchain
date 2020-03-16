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
        this.flights = [];
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

            let flightCount = 0;
            while(this.flights.length < 5) {
                let flight = 'ND134'+flightCount;
                let timestamp = String(Math.floor(Date.now() / 10000)) + flightCount;
                this.flights.push(flight + '|' + timestamp);
                flightCount++;
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

    isAirlineActive(airlineAddress, callback) {
        let self = this;
        self.flightSuretyData.methods
            .isAirlineActive(airlineAddress)
            .call({ from: self.owner}, callback);
    }

    isAirlineRegistered(airlineAddress, callback) {
        let self = this;
        self.flightSuretyData.methods
            .isAirlineRegistered(airlineAddress)
            .call({ from: self.owner}, callback);
    }

    registerAirline(airlineAddress, callerAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress
        };
        self.flightSuretyApp.methods
            .registerAirline(payload.airlineAddress)
            .send({ from: callerAddress, gas:500000000}, (error, result) => {
                callback(error, payload);
            });
    }

    airlineFund(callerAddress, amount, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .airlineFund()
            .send({ from: callerAddress, value:Number(amount)*1000000000000000000,gas:500000000}, callback);
    }

    registerFlight(flightTimestamp, callerAirlineAddress, callback) {
        let self = this;
        let {flight, timestamp} = this.parseFlightTimestamp(flightTimestamp);
        let payload = {
            flight: flight,
            timestamp: timestamp,
        };
        self.flightSuretyApp.methods
            .registerFlight(payload.flight, payload.timestamp)
            .send({ from: callerAirlineAddress, gas:500000000}, callback);
    }

    isFlightRegistered(airlineAddress, flightTimestamp, callback) {
        let self = this;
        let {flight, timestamp} = this.parseFlightTimestamp(flightTimestamp);
        self.flightSuretyApp.methods
            .isFlightRegistered(airlineAddress, flight, timestamp)
            .call({ from: self.owner}, callback);
    }

    buyInsurance(airlineAddress, flightTimestamp, amount, passengerAddress, callback) {
        let self = this;
        let {flight, timestamp} = this.parseFlightTimestamp(flightTimestamp);
        let payload = {
            airline: airlineAddress,
            flight: flight,
            timestamp: timestamp,
        };
        self.flightSuretyApp.methods
            .buyInsurance(payload.airline, payload.flight, payload.timestamp)
            .send({ from: passengerAddress, value:Number(amount)*1000000000000000000, gas:500000000}, (error, result) => {
                callback(error, payload);
            });
    }

    insuranceInfo(airlineAddress, flightTimestamp, passengerAddress, callback) {
        let self = this;
        let {flight, timestamp} = this.parseFlightTimestamp(flightTimestamp);
        self.flightSuretyData.methods
            .insuranceInfo(airlineAddress, flight, timestamp, passengerAddress)
            .call({ from: self.owner}, callback);
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
            .send({ from: self.owner,gas:500000000}, (error, result) => {
                callback(error, payload);
            });
    }

    parseFlightTimestamp(flightTimestamp) {
        let arr = flightTimestamp.split("|");
        let flight = arr[0];
        let timestamp = Number(arr[1]);
        return {flight, timestamp};
    }
}