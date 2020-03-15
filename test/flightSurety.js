var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');


contract('Flight Surety Tests', async (accounts) => {
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address,{from: config.owner});

    // let value = web3.utils.toWei("3", "ether");
    // await config.flightSuretyApp.transferEther({value:value});
    // let r = await config.flightSuretyData.testing();
    // console.log('RRRR ', Number(r));
  });


  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try
      {
          await config.flightSuretyData.setTestingMode();
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    // ARRANGE
    let newAirline = accounts[2];
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {
    }
    let result = await config.flightSuretyData.isAirlineRegistered(newAirline);
    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
  });

    it('(airline) is able to register an Airline using registerAirline() when it is funded', async () => {
        let contractBalanceBefore = await config.flightSuretyData.contractBalance();
        let balanceOfAirlineBeforeTransaction = await web3.eth.getBalance(config.firstAirline);

        let airlineRegistratoinFee = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();
        let value = web3.utils.toWei("20", "ether");
        await config.flightSuretyApp.airlineFund({from:config.firstAirline, value:value});

        let newAirline = accounts[2];
        try {
            await config.flightSuretyApp.airlineFund({from:newAirline, value:value});
        }catch (e) {
            assert.equal(e.reason,'Caller is not a registered airline');
        }

        let contractBalanceAfter = await config.flightSuretyData.contractBalance();
        assert.equal(Number(contractBalanceAfter), Number(airlineRegistratoinFee)+Number(contractBalanceBefore));

        let balanceOfAirlineAfterTransaction = await web3.eth.getBalance(config.firstAirline);
        let maxGas = web3.utils.toWei("1", "ether");
        assert.equal(Number(balanceOfAirlineBeforeTransaction) - Number(balanceOfAirlineAfterTransaction) - Number(airlineRegistratoinFee) < Number(maxGas), true);

        let isActive = await config.flightSuretyData.isAirlineActive.call(config.firstAirline)
        assert.equal(isActive, true, "The first airline should be active since its fund is submitted");

        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline);
        assert.equal(result, true, "Airline should be able to register another airline since its fund is submitted");

    });
    it('Existing airline can register a new airline until there are at least 4 airlines registered', async () => {
        let airline3 = accounts[3];
        let airline4 = accounts[4];
        let airline5 = accounts[5];
        await config.flightSuretyApp.registerAirline(airline3, {from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(airline4, {from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(airline5, {from: config.firstAirline});

        let result = await config.flightSuretyData.isAirlineRegistered.call(airline3);
        assert.equal(result, true, "The 3rd airline should be registered");
        result = await config.flightSuretyData.isAirlineRegistered.call(airline4);
        assert.equal(result, true, "The 4th airline should be registered");
        result = await config.flightSuretyData.isAirlineRegistered.call(airline5);
        assert.equal(result, false, "The 5th airline should not be registered");

    });

    it('Airline cannot vote for another airline more than once', async () => {
        let isDup = false;
        let airline5 = accounts[5];
        try{
            await config.flightSuretyApp.registerAirline(airline5, {from: config.firstAirline});
        }catch (e) {
            isDup=true;
        }
        assert.equal(isDup, true, "Airline cannot vote for another airline more than once");
    });

    it('Registration of the 5th airline requires multi-party consensus of 50%', async () => {

        let newAirline = accounts[2];
        let value = await config.flightSuretyApp.AIRLINE_REGISTRATION_FEE.call();
        await config.flightSuretyApp.airlineFund({from:newAirline, value:value});

        let isActive = await config.flightSuretyData.isAirlineActive.call(newAirline)
        assert.equal(isActive, true, "The newAirline should be active since its fund is submitted");

        let airline5 = accounts[5];
        await config.flightSuretyApp.registerAirline(airline5, {from: newAirline});

        let result = await config.flightSuretyData.isAirlineRegistered.call(airline5);
        assert.equal(result, true, "The 5th airline should be registered with 50% vote count");

    });


});
