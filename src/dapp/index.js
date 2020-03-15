
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        populateAirlines(contract.airlines);

        display('Owner', '', [ { label: 'Address', error: null, value: contract.owner} ]);

        display('Airlines', 'Addresses', [
            {label: 'Airline1', error: null, value: contract.airlines[0] + ' (Registered)'},
            {label: 'Airline2', error: null, value: contract.airlines[1]},
            {label: 'Airline3', error: null, value: contract.airlines[2]},
            {label: 'Airline4', error: null, value: contract.airlines[3]},
            {label: 'Airline5', error: null, value:contract.airlines[4]},
            ]);

        display('Passengers', 'Addresses', [
            {label: 'Passenger1', error: null, value: contract.passengers[0]},
            {label: 'Passenger2', error: null, value: contract.passengers[1]},
            {label: 'Passenger3', error: null, value: contract.passengers[2]},
            {label: 'Passenger4', error: null, value: contract.passengers[3]},
            {label: 'Passenger5', error: null, value: contract.passengers[4]},
        ]);

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
                    display('Airlines', '', [ { label: 'Airline Address', error: error}, { label: 'Action', error: error} ]);
                }else {
                        contract.isAirlineRegistered(airlineAddress,(e, r)=>{
                            console.log('isAirlineRegistered:', r);
                            display('Airlines', '', [ { label: 'Airline Address', error: e, value: airlineAddress}, { label: 'Action', error: e, value: 'Registered'} ]);
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
                    display('Airlines', '', [ { label: 'Airline Address', error: error}, { label: 'Action', error: error} ]);
                }else {
                    contract.isAirlineActive(callerAddress,(e, r)=>{
                        console.log('isAirlineActive:', r);
                        display('Airlines', '', [ { label: 'Airline Address', error: e, value: callerAddress}, { label: 'Action', error: e, value: 'Funded'} ]);
                    });
                }

            });
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                console.log(error,result);
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
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






