
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
        "0x83C4e20f6aE4bf99006E956f7a8C4957a19719bD",
        "0xe4129DBe9B5751a8A4a3071A3aE25b6Effc44A3d",
        "0x189037Bd40DF9B30683eb735DF05bb98CA469917",
        "0x4B30A01A9E605d05952f7D1cDf61D07caB38DB15",
        "0x46c2f2f4CCe847202841aE6F5E28BE70a667D804",
        "0xB33Dbc39B71c3261B48B06583bc0BeE037f512D2",
        "0xcdA21a016c40bC4A8E887ffA096b20B27B4e5EAb",
        "0xCB03e4571B7Cb6f5904A834C14F820453AE9ce5c",
        "0x430ae38b64C9f1d950368761A440F8bC7fEf9D8f",
        "0x56Ae55107a1ecD26E4ACa38375C76B113a559d69",
        "0x73C91DAE21030ab09BebE672a85fd0C26c601f28",
        "0x0034b71e3716641B700B132Fae5d78955A8708ea",
        "0x624E6aa5e3785233619275cF61117ECd6A5dE967",
        "0xFe54E8fC8C438f815534b74b0b898515dF61Ae41",
        "0x91832dfC298631f73832eAE39768F91d8b561183",
        "0x8Dd1296c94D04111513465aF3C8f0CCA378F43DF",
        "0xec10FDB88cC57FDa33c4872c441D84ff42B3810b"
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new(firstAirline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: accounts,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};