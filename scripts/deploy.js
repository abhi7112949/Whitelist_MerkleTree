// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

async function main() {
    // Create an array of elements you wish to encode in the Merkle Tree
    function encodeLeaf(address, spots) {
        // Same as `abi.encodePacked` in Solidity
        return ethers.utils.defaultAbiCoder.encode(
            ["address", "uint64"],
            [address, spots]
        );
    }

    const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    const list = [
        encodeLeaf(owner.address, 2),
        encodeLeaf(addr1.address, 2),
        encodeLeaf(addr2.address, 2),
        encodeLeaf(addr3.address, 2),
        encodeLeaf(addr4.address, 2),
        encodeLeaf(addr5.address, 2),
    ];

    // Create the Merkle Tree using the hashing algorithm `keccak256`
    // Make sure to sort the tree so that it can be produced deterministically regardless
    // of the order of the input list
    const merkleTree = new MerkleTree(list, keccak256, {
        hashLeaves: true,
        sortPairs: true,
    });
    // Compute the Merkle Root
    const root = merkleTree.getHexRoot();

    // Deploy the Whitelist contract
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.deployed();
    console.log("Whitelist deployed to :", await Whitelist.address)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
