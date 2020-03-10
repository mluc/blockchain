
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x40c5F88B6F0a46EeDF8645e90792e0fD6f6bF261",
        "0x9EfD4768d671FdFed6F9F62D869ac864AD1BC878",
        "0x5D4506606EB888f8bfF1ad21F54999D0d1dbafBB",
        "0xb68e5E03957a4354524632D8B1D8aB8Ab6a53959",
        "0x80295a19f318d09CB9Ca66f897A6f9E82F51e27a",
        "0x9fF2d11B206fFD09d4d69A0bfe6370F91BEc07F1",
        "0xf71981F3C177ca6Da1cDbb8d9e7ca16f71B27013",
        "0xC5FBf122CF33531408eB077cE167fE3644B9309e",
        "0x83C4e20f6aE4bf99006E956f7a8C4957a19719bD"
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new(firstAirline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};