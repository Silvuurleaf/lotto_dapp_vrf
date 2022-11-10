const { expect } = require("chai");
const { ethers, artifacts} = require("hardhat");
const Web3 = require('web3');
const provider = ethers.provider;

describe("Lottery", function () {

    let lottoContract;
    beforeEach(async function () {
        const lottery = await ethers.getContractFactory("Lottery")
        lottoContract = await lottery.deploy();
        await lottoContract.deployed();

        [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    });

    it("Set the rake account", async function (){

        const address1 = await addr1.getAddress();

        await lottoContract.setRakeAccount(address1);

        let rakeAcc = await lottoContract.getRakeAccount();

        expect(rakeAcc).to.equal(address1.toString());
    })

    it("Check Balance of lottery smart contract before being funded", async function () {
        expect(await lottoContract.getBalance()).to.equal(0);
    });


    it('User should be able to enter lottery', async () => {

        await addr2.sendTransaction({
            to: lottoContract.address,
            value: ethers.utils.parseEther(".1"),
        })

        const players = await lottoContract.getPlayers()

        let address2 = await addr2.getAddress();

        expect(address2).to.equal(players[0]);
        expect(players.length).to.equal(1);
    });


    it('User should be able to enter lottery and pot account should increment', async () => {
        //let address1Balance = (await provider.getBalance(addr1.getAddress())).toString();
        //let before_rakeBalanceWEI = parseInt(Web3.utils.toWei(address1Balance,'ether'));

        let potBalance = await owner.getBalance();


        await addr2.sendTransaction({
            to: lottoContract.address,
            value: ethers.utils.parseEther(".1"),
        })

        const players = await lottoContract.getPlayers()

        let address2 = await addr2.getAddress();

        expect (address2).to.equal(players[0]);
        expect(players.length).to.equal(1);

        let rake_amount = .1*(2/100);
        let pot_amount = .1-rake_amount;

        //rake_amount = parseInt(Web3.utils.toWei((rake_amount).toString(), 'ether'));
        //let rakeBalance = (before_rakeBalanceWEI + rake_amount).toString(); //wei balance theoretically

        pot_amount = (Web3.utils.toWei(pot_amount.toString(), 'ether'));

        let potBalanceAfter = parseInt(await owner.getBalance());
        let change = (potBalanceAfter - potBalance).toString();


        //address1Balance = (await provider.getBalance(addr1.getAddress())).toString();

        //expect(rakeBalance).to.equal(address1Balance);

        expect(potBalanceAfter.toString()).to.equal(pot_amount);
    });



    const tests = [
        {args: ".0999", expected: 0},
        {args: ".0101", expected: 0},
    ]

    tests.forEach((test) =>
        it('should not allow user to enter lottery', async () => {

            const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

            expect (addr2.sendTransaction({
                to: lottoContract.address,
                value: ethers.utils.parseEther(test.args),
                gasLimit: 50000,
            })).to.be.revertedWith('Must be .1 ether')

            const players = await lottoContract.getPlayers();

            expect(players.length).to.equal(test.expected);

            //await expect(lottoContract.receive()).to.be.revertedWith('Must be .1 ether');

        }));

    //parameterized with different number of players
    it('pickWinner should revert not enough participants', async () => {
        //await expectRevert(await lottoContract.pickWinner());

        await expect(lottoContract.pickWinner()).to.be.revertedWith(
            "Not enough participants");
    })


    it('pickWinner should revert not the owner', async () => {
        //await expectRevert(await lottoContract.pickWinner());

        await expect(lottoContract.connect(addr3).pickWinner()).to.be.revertedWith(
            "You aren't the owner");
    })

    it('pickWinner should select a winner', async () => {

        const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

        const addrs = [addr2, addr3, addr4];

        for (var i = 0; i < addrs.length; i++)
        {
            await addrs[i].sendTransaction({
                to: lottoContract.address,
                gasLimit: 500000,
                value: ethers.utils.parseEther(".1"),
            })
        }

        const players = await lottoContract.getPlayers();

        expect(players.length).to.equal(3);

        await lottoContract.pickWinner();

        let requestId = await lottoContract.getRequestID();

        let winner;

        setTimeout(async function () {
            winner = await lottoContract.getStatuses(requestId);

        }, 30000);

        expect(players.includes(winner));
    })

});