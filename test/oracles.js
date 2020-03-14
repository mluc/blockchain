const  truffleAssert = require('truffle-assertions')
var Test = require('../config/testConfig.js');
//var BigNumber = require('bignumber.js');

contract('Oracles', async (accounts) => {

  // Watch contract events
  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_AIRLINE = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;

  const TEST_ORACLES_COUNT = 20;
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address,{from: config.owner});

  });


  it('can register oracles', async () => {

    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

    // ACT
    for(let a=2; a<TEST_ORACLES_COUNT+1; a++) {
      await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
      let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      //console.log(`${accounts[a]} Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
  });


  it('can request flight status: not on time', async () => {

    // ARRANGE
    let flight = 'ND1309'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);

    //buy insurance
    let passenger1 = accounts[21];
    let passenger2 = accounts[22];
    let contractBalanceBefore = await config.flightSuretyData.contractBalance();
    let insuranceAmount = web3.utils.toWei("1", "ether");
    await config.flightSuretyApp.buyInsurance(config.firstAirline, flight, timestamp,{from:passenger1, value:insuranceAmount});
    let insuranceAmountReturn = await config.flightSuretyData.insuranceInfo(config.firstAirline, flight, timestamp,passenger1);
    console.assert(insuranceAmount, insuranceAmountReturn['insuranceAmount']);
    let payoutAmount = insuranceAmountReturn['payoutAmount'];
    console.assert(insuranceAmount*1.5, payoutAmount);

    let contractBalanceAfter = await config.flightSuretyData.contractBalance();
    assert.equal(Number(contractBalanceAfter), Number(contractBalanceBefore) + Number(insuranceAmount));

    //register flights (need to register by a active/funded airline)
    let value = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();
    await config.flightSuretyApp.airlineFund({from:config.firstAirline, value:value});
    await config.flightSuretyApp.registerFlight(flight, timestamp,{from:config.firstAirline});

    let isFlightRegistered = await config.flightSuretyApp.isFlightRegistered(config.firstAirline, flight, timestamp);
    assert.equal(isFlightRegistered, true);


    // Submit a request for oracles to get status information for a flight
    var fetchResult = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
    truffleAssert.eventEmitted(fetchResult, "OracleRequest");
    console.log(`\n\nOracle Requested: index: ${fetchResult.logs[0].args.index.toNumber()}, flight:  ${fetchResult.logs[0].args.flight}, timestamp: ${fetchResult.logs[0].args.timestamp.toNumber()}`);

    // // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature


    for(let a=2; a<TEST_ORACLES_COUNT+1; a++) {

      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
      for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          var result = await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_LATE_AIRLINE, { from: accounts[a] });
          truffleAssert.eventEmitted(result, "FlightStatusInfo");
          console.log(`\n\nFlight Status Available: flight: ${result.logs[0].args.flight}, timestamp: ${result.logs[0].args.timestamp.toNumber()}, status: ${result.logs[0].args.status.toNumber() == STATUS_CODE_ON_TIME ? 'ON TIME' : 'NOT ON TIME'}, verified: ${result.logs[0].args.verified ? 'VERIFIED' : 'UNVERIFIED'}`);

          // Check to see if flight status is available
          // Only useful while debugging since flight status is not hydrated until a
          // required threshold of oracles submit a response
          //let flightStatus = await config.exerciseC6D.viewFlightStatus(flight, timestamp);
          //console.log('\nPost', idx, oracleIndexes[idx].toNumber(), flight, timestamp, flightStatus);
        }
        catch(e) {
          // Enable this when debugging
          assert.equal(e.reason === 'Flight or timestamp do not match oracle request' || e.reason==='Index does not match oracle request', true)
          //console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
        }
      }
    }

    let flightStatus = await config.flightSuretyApp.viewFlightStatus(config.firstAirline, flight, timestamp);
    assert.equal(flightStatus.toNumber(), STATUS_CODE_LATE_AIRLINE)
    let isPassengerCredited = await config.flightSuretyData.isPassengerCredited(config.firstAirline, flight, timestamp, passenger1);
    assert.equal(isPassengerCredited, true)
    isPassengerCredited = await config.flightSuretyData.isPassengerCredited(config.firstAirline, flight, timestamp, passenger2);
    assert.equal(isPassengerCredited, false)

    contractBalanceBefore = await config.flightSuretyData.contractBalance();
    let balanceOfPassengerBeforeTransaction = await web3.eth.getBalance(passenger1);

    await config.flightSuretyApp.payCustomer(config.firstAirline, flight, timestamp,{from:passenger1});

    contractBalanceAfter = await config.flightSuretyData.contractBalance();
    let balanceOfPassengerAfterTransaction = await web3.eth.getBalance(passenger1);

    assert.equal(Number(contractBalanceBefore)-Number(payoutAmount), Number(contractBalanceAfter));
    assert.equal(Number(balanceOfPassengerBeforeTransaction)<Number(balanceOfPassengerAfterTransaction), true);

  });


  it('can request flight status: on time', async () => {

    // ARRANGE
    let flight = 'ND1340'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);

    //buy insurance
    let passenger1 = accounts[21];
    let insuranceAmount = web3.utils.toWei("2", "ether");
    try{
      await config.flightSuretyApp.buyInsurance(config.firstAirline, flight, timestamp,{from:passenger1, value:insuranceAmount});

    }catch (e) {
      assert.equal(e.reason, 'max insurance amount is 1 ether');
    }
    insuranceAmount = web3.utils.toWei("1", "ether");
    await config.flightSuretyApp.buyInsurance(config.firstAirline, flight, timestamp,{from:passenger1, value:insuranceAmount});

    //register flights
    await config.flightSuretyApp.registerFlight(flight, timestamp,{from:config.firstAirline});


    // Submit a request for oracles to get status information for a flight
    var fetchResult = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
    truffleAssert.eventEmitted(fetchResult, "OracleRequest");
    console.log(`\n\nOracle Requested: index: ${fetchResult.logs[0].args.index.toNumber()}, flight:  ${fetchResult.logs[0].args.flight}, timestamp: ${fetchResult.logs[0].args.timestamp.toNumber()}`);

    // // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature


    for(let a=2; a<TEST_ORACLES_COUNT+1; a++) {

      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
      for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          var result = await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] });
          truffleAssert.eventEmitted(result, "FlightStatusInfo");
          console.log(`\n\nFlight Status Available: flight: ${result.logs[0].args.flight}, timestamp: ${result.logs[0].args.timestamp.toNumber()}, status: ${result.logs[0].args.status.toNumber() == STATUS_CODE_ON_TIME ? 'ON TIME' : 'NOT ON TIME'}, verified: ${result.logs[0].args.verified ? 'VERIFIED' : 'UNVERIFIED'}`);

          // Check to see if flight status is available
          // Only useful while debugging since flight status is not hydrated until a
          // required threshold of oracles submit a response
          //let flightStatus = await config.exerciseC6D.viewFlightStatus(flight, timestamp);
          //console.log('\nPost', idx, oracleIndexes[idx].toNumber(), flight, timestamp, flightStatus);
        }
        catch(e) {
          // Enable this when debugging
          assert.equal(e.reason === 'Flight or timestamp do not match oracle request' || e.reason==='Index does not match oracle request', true)
          //console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
        }
      }
    }

    let flightStatus = await config.flightSuretyApp.viewFlightStatus(config.firstAirline, flight, timestamp);
    assert.equal(flightStatus.toNumber(), STATUS_CODE_ON_TIME)
    let isPassengerCredited = await config.flightSuretyData.isPassengerCredited(config.firstAirline, flight, timestamp, passenger1);
    assert.equal(isPassengerCredited, false)

    //test pay
    let contractBalanceBefore = await config.flightSuretyData.contractBalance();
    let balanceOfPassengerBeforeTransaction = await web3.eth.getBalance(passenger1);
    try{
      await config.flightSuretyApp.payCustomer(config.firstAirline, flight, timestamp,{from:passenger1});

    }catch (e) {
      assert.equal(e.reason, 'this passenger is not eligible to get paid')
    }

    let contractBalanceAfter = await config.flightSuretyData.contractBalance();
    let balanceOfPassengerAfterTransaction = await web3.eth.getBalance(passenger1);

    assert.equal(Number(contractBalanceBefore), Number(contractBalanceAfter));
    assert.equal(Number(balanceOfPassengerBeforeTransaction)>Number(balanceOfPassengerAfterTransaction), true);

  });

});
