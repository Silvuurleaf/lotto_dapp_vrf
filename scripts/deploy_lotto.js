const hre = require("hardhat");


async function main() {

    const Lotto = await hre.ethers.getContractFactory("Lottery");
    const lotto = await Lotto.deploy();
    await lotto.deployed();

    console.log(
        `Lotto deployed to ${lotto.address}`
    );

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
