
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

const statusCodeToString = {
    0: 'UNKNOWN',
    10: 'ON TIME',
    20: 'LATE AIRLINE',
    30: 'LATE WEATHER',
    40: 'LATE TECHNICAL',
    50: 'LATE OTHER',
};

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        populateAirlines(contract.airlines);
        populatePassengers(contract.passengers);
        populateFlightTimeStamp(contract.flights, contract.timestamps);

        contract.authorizeContract((error, result) => {
            console.log('authorizeContract:', error,result);
            contract.isOperational((e, r) => {
                console.log('isOperational:', e,r);
                display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: e, value: r} ]);
            });
        });


        //registerAirline
        DOM.elid('register-airline').addEventListener('click', () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let callerAddress = DOM.elid('register-airline-caller-address').value;
            contract.registerAirline(airlineAddress, callerAddress, (error, result) => {
                console.log('registerAirline:', error,result);
                if(error){
                    display('Airlines', '', [ { label: 'Airline Address', error: error} ]);
                }else {
                        contract.isAirlineRegistered(airlineAddress,(e, r)=>{
                            console.log('isAirlineRegistered:', r);
                            display('Airlines', '', [ { label: 'Airline Address', error: e, value: airlineAddress}, { label: 'Result', error: e, value: r? 'Registered': 'Not Registered (multi-party consensus of 50% is required)'} ]);
                    });
                }
            });
        });

        //airline submits fund
        DOM.elid('fund-money').addEventListener('click', () => {
            let callerAddress = DOM.elid('fund-money-caller-address').value;
            let amount = DOM.elid('airline-amount').value;
            // Write transaction
            contract.airlineFund(callerAddress, amount, (error, result) => {
                console.log('airlineFund:', error,result);
                if(error){
                    display('Airlines', '', [ { label: 'Airline Address', error: error} ]);
                }else {
                    contract.isAirlineActive(callerAddress,(e, r)=>{
                        console.log('isAirlineActive:', r);
                        display('Airlines', '', [ { label: 'Airline Address', error: e, value: callerAddress}, { label: 'Result', error: e, value: 'Funded'} ]);
                    });
                }

            });
        });

        //register flight
        DOM.elid('register-flight').addEventListener('click', () => {
            let flightTimestamp = DOM.elid('flights').value;
            let airlineAddress = DOM.elid('insurance-airline-addresses').value;
            contract.registerFlight(flightTimestamp, airlineAddress,(error, result) => {
                console.log('registerFlight:', error,result);
                let des = flightTimestamp + '|' + airlineAddress;
                if(error){
                    display('Flights', 'Register flight', [ { label: 'Flight Info', value:des}, { label: 'Error', error: error} ]);
                }else {
                    contract.isFlightRegistered(airlineAddress, flightTimestamp,(e, r)=>{
                        console.log('isFlightRegistered:', r);
                        display('Flights', 'Register flight', [{ label: 'Flight Info', error: e, value:des},  { label: 'Result', error: e, value: 'Registered'} ]);
                    });
                }
            });
        })


        //buy insurance
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flightTimestamp = DOM.elid('flights').value;
            let airlineAddress = DOM.elid('insurance-airline-addresses').value;
            let passengerAddress = DOM.elid('passenger-addresses').value;
            let amount = DOM.elid('insurance-amount').value;
            let des = flightTimestamp + '|' + airlineAddress;
            contract.buyInsurance(airlineAddress, flightTimestamp, amount, passengerAddress,(error, result) => {
                console.log('buyInsurance:', error,result);
                if(error){
                    display('Passengers', 'Buy insurance', [ { label: 'Flight Info', value:des}, { label: 'Error', error: error} ]);
                }else {
                    contract.insuranceInfo(airlineAddress, flightTimestamp,passengerAddress, (e, r)=>{
                        console.log('insuranceInfo:', r);
                        display('Passengers', 'Buy insurance', [{ label: 'Flight Info', error: e, value:des},  { label: 'Insurance amount', error: e, value: r['insuranceAmount']}, { label: 'Payout amount if delayed', error: e, value: r['payoutAmount']} ]);
                    });
                }
            });
        })

        // oracle
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flightTimestamp = DOM.elid('fetch-flight').value;
            let airlineAddress = DOM.elid('fetch-airline-address').value;
            contract.fetchFlightStatus(airlineAddress, flightTimestamp, (error, result) => {
                console.log('fetchFlightStatus', error,result);
                if(error){
                    display('Oracles', 'Fetch Flight Status', [ { label: 'Error', error: error} ]);
                }else {
                    display('Oracles', 'Fetch Flight Status', [ { label: 'Flight | Timestamp', value: result.flight + ' | ' + result.timestamp + ' | ' + airlineAddress} ]);

                }
            });
        })

        // view flight status
        DOM.elid('view-flight-status').addEventListener('click', () => {
            let flightTimestamp = DOM.elid('fetch-flight').value;
            let airlineAddress = DOM.elid('fetch-airline-address').value;
            contract.viewFlightStatus(airlineAddress, flightTimestamp, (error, result) => {
                console.log('viewFlightStatus', error,result);
                if(error){
                    display('Flights', 'View Flight Status', [{ label: 'Flight | Timestamp', value: flightTimestamp +'|'+airlineAddress}, { label: 'Flight Status', error: error} ]);
                }else {
                    console.log('has result', result['hasResult'], result['statusCode'])
                    let status = statusCodeToString[result['statusCode']]
                    display('Flights', 'View Flight Status', [ { label: 'Flight | Timestamp', value: flightTimestamp +'|'+airlineAddress}, { label: 'Status', value: status} ]);

                }
            });
        })

        // pay passenger
        DOM.elid('payout-passenger').addEventListener('click', () => {
            let flightTimestamp = DOM.elid('payout-flight').value;
            let airlineAddress = DOM.elid('payout-airline-address').value;
            let passengerAddress = DOM.elid('payout-passenger-address').value;
            contract.payCustomer(airlineAddress, flightTimestamp, passengerAddress,(error, result) => {
                console.log('payCustomer', error,result);
                display('Passenger', 'Payout', [{ label: 'Flight | Timestamp', value: flightTimestamp +'|'+airlineAddress}, { label: 'Status', error: error, value:'Paid'} ]);
            });
        })

        // passenger balance
        DOM.elid('passenger-balance').addEventListener('click', () => {
            let passengerAddress = DOM.elid('payout-passenger-address').value;
            contract.getPassengerBalance(passengerAddress).then(function (result) {
                let resultEther = Number(result)/1000000000000000000;
                console.log('getPassengerBalance', resultEther);
                display('Passenger', '', [{ label: 'Passenger Address', value: passengerAddress}, { label: 'Balance(ether)', value: resultEther} ]);
            })

        })
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}


function populateAirlines(airlines) {
    let displayDiv = DOM.elid("fund-money-caller-address");
    populate(displayDiv);
    displayDiv = DOM.elid("register-airline-caller-address");
    populate(displayDiv);
    displayDiv = DOM.elid("airline-address");
    populate(displayDiv);
    displayDiv = DOM.elid("insurance-airline-addresses");
    populate(displayDiv);
    displayDiv = DOM.elid("fetch-airline-address");
    populate(displayDiv);
    displayDiv = DOM.elid("payout-airline-address");
    populate(displayDiv);

    function populate(displayDiv) {
        for (var i = 0; i < airlines.length; i++) {
            var opt = airlines[i];
            var el = DOM.makeElement('option');
            el.textContent = opt + '(Airline' + (i+1) + ')';
            el.value = opt;
            displayDiv.appendChild(el);
        }
    }
}

function populatePassengers(passengers) {
    let displayDiv = DOM.elid("passenger-addresses");
    populate(displayDiv);
    displayDiv = DOM.elid("payout-passenger-address");
    populate(displayDiv);

    function populate(displayDiv) {
        for (var i = 0; i < passengers.length; i++) {
            var opt = passengers[i];
            var el = DOM.makeElement('option');
            el.textContent = opt + '(Passenger' + (i+1) + ')';
            el.value = opt;
            displayDiv.appendChild(el);
        }
    }
}

function populateFlightTimeStamp(flights) {
    let displayDiv = DOM.elid("flights");
    populate(displayDiv, flights);
    displayDiv = DOM.elid("fetch-flight");
    populate(displayDiv, flights);
    displayDiv = DOM.elid("payout-flight");
    populate(displayDiv, flights);


    function populate(displayDiv, items) {
        for (var i = 0; i < items.length; i++) {
            var opt = items[i];
            var el = DOM.makeElement('option');
            el.textContent = opt;
            el.value = opt;
            displayDiv.appendChild(el);
        }
    }
}






