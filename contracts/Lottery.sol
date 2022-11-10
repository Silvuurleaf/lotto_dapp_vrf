//SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;

import '@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol';

contract Lottery is VRFV2WrapperConsumerBase{

    bytes32 public keyHash;
    uint256 public fee;
    uint256 public randomResult;

    address payable public rake_acc;
    address public owner; //person who deployed lottery
    address payable[] public players;

    uint256 public entryFee = .1 ether;

    struct randomNumberStatus {
        uint256 fees;
        uint256 randomWord;
        bool fulfilled;
        address winner;
    }

    mapping(uint256 => randomNumberStatus) public statuses;

    address constant LINK_ADDRESS = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address constant VRFWRAPPER_ADDRESS = 0x708701a1DfF4f478de54383E49a627eD4852C816;
    address constant VRF_COORDINATOR_ADDRESSS = 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D;

    uint32 constant callbackGasLimit = 1_000_000;
    uint32 constant numWords = 1;
    uint16 constant requestConfirmations = 3;

    uint256 private random_requestId;



    constructor() VRFV2WrapperConsumerBase(LINK_ADDRESS, VRFWRAPPER_ADDRESS){
        //owner also stores the pot
        owner = msg.sender; //person who deployed contract's address
    }

    function setRakeAccount(address rake_address) public onlyOwner {
        require(msg.sender == owner, "You aren't the owner");

        rake_acc = payable(rake_address);
    }

    receive() external payable {
        require(msg.value == entryFee, "Must be .1 ether");

        uint rake = msg.value * 2 / 100;
        rake_acc.transfer(rake);

        players.push(payable(msg.sender));
    }

    function getBalance() public view returns(uint){
        require(msg.sender == owner, "You aren't the owner");
        return address(this).balance;
    }

    function getRakeAccount() public view returns(address)
    {
        return rake_acc;
    }

    //memory stored only temp storage for duration of function
    function getPlayers() public view returns (address payable[] memory)
    {
        return players;
    }

    function requestRandom() internal {

        uint256 requestId = requestRandomness(callbackGasLimit, requestConfirmations, numWords);

        statuses[requestId] = randomNumberStatus({
        fees: VRF_V2_WRAPPER.calculateRequestPrice(callbackGasLimit),
        randomWord: 0,
        fulfilled: false,
        winner: msg.sender

        });

        random_requestId = requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(statuses[requestId].fees > 0, "Request was not found");

        statuses[requestId].fulfilled = true;
        statuses[requestId].randomWord = randomWords[0];

        uint256 r = randomWords[0];

        address payable winner;

        uint index = r % players.length;
        winner = players[index];

        statuses[requestId].winner = winner;
    }


    function random() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players.length)));
    }

    function pickWinner() public{
        require(msg.sender == owner, "You aren't the owner");
        require(players.length >= 3, "Not enough participants");

        requestRandom();
    }

    function transferWinner(uint256 requestId) public  onlyOwner{
        require(msg.sender == owner,"You aren't the owner");
        require(statuses[requestId].fulfilled == true);

        //this == current smart contract
        payable(statuses[requestId].winner).transfer(address(this).balance);

        //reset state of the contract
        players = new address payable[](0);

        players = new address payable[](0); //resets the lottery
    }

    function getRequestID () public view returns (uint256) {
        return random_requestId;
    }

    function getStatuses (uint256 requestId) public view returns(randomNumberStatus memory)
    {
        return statuses[requestId];
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
}