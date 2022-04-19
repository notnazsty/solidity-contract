const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");


describe("Minting Tests", () => {
  it("Singular Mint", async () => {
    const contractFactory = await ethers.getContractFactory('SampleContract')
    const deployedContract = await contractFactory.deploy()

    await deployedContract.deployed()

    console.log('Deployed')

    await deployedContract.updateBaseURI("https://www.google.com")

    await deployedContract.setInitialSale(true);

    await deployedContract.setReservedSale(true);


    let mint = await deployedContract.mintSaleToken(1, { value: ethers.utils.parseEther("0.001") })

    await mint.wait()

    // const [owner] = await ethers.getSigners()

    // await deployedContract.setReservedAddresses([owner.address])

    // let reservedMint = await deployedContract.mintReservedToken({ value: ethers.utils.parseEther("0.001") })

    // await reservedMint.wait()

  })

  it("Mass Mint 1 Per Address", async () => {
    const contractFactory = await ethers.getContractFactory('SampleContract')
    const deployedContract = await contractFactory.deploy()

    await deployedContract.deployed()

    await deployedContract.setInitialSale(true);

    const provider = deployedContract.provider;

    const [owner] = await ethers.getSigners();

    console.log("Initial: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber())
    for (let i = 0; i < 6; i++) {
      const wallet = ethers.Wallet.createRandom().connect(provider)

      await owner.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") })

      let mint = await deployedContract.connect(wallet).mintSaleToken(1, { value: ethers.utils.parseEther("0.001") })
      await mint.wait()

    }
    console.log("Regular Mints: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber())

    // for (let i = 0; i <= 1; i++) {
    //   await deployedContract.setReservedSale(true)
    //   const wallet = ethers.Wallet.createRandom().connect(provider)

    //   await deployedContract.setReservedAddresses([wallet.address])

    //   await owner.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") })

    //   let mint = await deployedContract.connect(wallet).mintReservedToken({ value: ethers.utils.parseEther("0.001") })
    //   await mint.wait()

    // }

    // console.log("Reserved Mints:", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber() - 2)
    console.log("Expected Sum: 8")

  })

  it("Mass Mint Multiple", async () => {
    const contractFactory = await ethers.getContractFactory('SampleContract')
    const deployedContract = await contractFactory.deploy()

    await deployedContract.deployed()

    await deployedContract.setInitialSale(true);

    let mint1 = await deployedContract.mintSaleToken(1, { value: ethers.utils.parseEther("0.001") })
    await mint1.wait()
    console.log('Minted 1 Token with Owner Address')

    let mint2 = await deployedContract.mintSaleToken(2, { value: ethers.utils.parseEther("0.002") })
    await mint2.wait()



    console.log()

  })
})


describe("Full Amount Mint Tests", function () {
  it("75 Sale Minted + 25 Reserved Minted ", async () => {
    const contractFactory = await ethers.getContractFactory('SampleContract')
    const deployedContract = await contractFactory.deploy()

    await deployedContract.deployed()

    await deployedContract.setInitialSale(true);

    const provider = deployedContract.provider;

    const [owner] = await ethers.getSigners();

    console.log("Initial: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber(), " Minted")

    for (let i = 0; i < 75; i++) {

      const wallet = ethers.Wallet.createRandom().connect(provider)

      await owner.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") })

      let mint = await deployedContract.connect(wallet).mintSaleToken(1, { value: ethers.utils.parseEther("0.001") })
      await mint.wait()

      console.log("Successfully Minted: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber(), " Minted")

    }

    console.log("Successfully Minted: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber(), " Minted")

    console.log("Attempting to Mint Reserved Supply")

    await deployedContract.setReservedSale(true);

    // for (let i = 0; i < 25; i++) {
    //   await deployedContract.setReservedSale(true)
    //   const wallet = ethers.Wallet.createRandom().connect(provider)

    //   await deployedContract.setReservedAddresses([wallet.address])

    //   await owner.sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") })

    //   let mint = await deployedContract.connect(wallet).mintReservedToken({ value: ethers.utils.parseEther("0.001") })
    //   await mint.wait()

    //   console.log(" Minted ", i + 1, " Reserve Tokens")


    // }

    console.log("Successfully Minted: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber(), " Minted")


  }).timeout(10000000000000)
})


describe('first', function () {

  it("hmm", async function () {
    const contractFactory = await ethers.getContractFactory('SampleContract')
    const deployedContract = await contractFactory.deploy()

    await deployedContract.deployed()

    console.log('Deployed')

    await deployedContract.setInitialSale(true);

    await deployedContract.setReservedSale(true);

    let mint = await deployedContract.mintSaleToken(1, { value: ethers.utils.parseEther("0.001") })

    await mint.wait()

    mint = await deployedContract.mintSaleToken(1, { value: ethers.utils.parseEther("0.001") })

    await mint.wait()

    await deployedContract.updateBaseURI("https://www.google.com/")

    const [owner] = await ethers.getSigners()

    const tokenIDs = await deployedContract.tokensOfOwner(owner.address);
    console.log("TokenIDs of OWNER:  ", tokenIDs)

    for (let i = 0; i < tokenIDs.length; i++) {
      const tokenURI = await deployedContract.tokenURI(tokenIDs[i]);
      console.log(tokenURI)
    }

    const changeBaseURI = await deployedContract.updateBaseURI('useless/')
    await changeBaseURI.wait()

    for (let i = 0; i < tokenIDs.length; i++) {
      const tokenURI = await deployedContract.tokenURI(tokenIDs[i]);
      console.log(tokenURI)
    }




  }).timeout(100000)

});



describe("Reserved Minting", function () {
  it("Reserved Mint Test #1", async function () {

    const contractFactory = await ethers.getContractFactory('SampleContract')
    const deployedContract = await contractFactory.deploy()

    await deployedContract.deployed()



    const provider = deployedContract.provider;
    const [owner] = await ethers.getSigners();

    let walletArray = []

    for (let i = 0; i < 25; i++) {
      const wallet = ethers.Wallet.createRandom().connect(provider)
      walletArray = [...walletArray, wallet]
    }

    const leafNodes = walletArray.map((wallet) => keccak256(wallet.address))
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
    const rootHash = merkleTree.getRoot()

    console.log(rootHash)

    const updateHash = await deployedContract.updateMerkleRoot(rootHash)
    // await updateHash.wait()

    await deployedContract.setReservedSale(true)

    for (let i = 0; i < walletArray.length; i++) {
      const proof = merkleTree.getHexProof(keccak256(walletArray[i].address))
      console.log(proof)
      await owner.sendTransaction({ to: walletArray[i].address, value: ethers.utils.parseEther("1") })
      let mint = await deployedContract.connect(walletArray[i]).mintReservedToken(proof)
      await mint.wait()
      // let mint2 = await deployedContract.connect(walletArray[i]).mintReservedToken(proof)
      // await mint2.wait()

    }


    console.log("Successfully Minted: ", ethers.BigNumber.from(await deployedContract.totalSupply()).toNumber(), " Minted")
    for (let i = 0; i < 25; i++) {
      if (await deployedContract.ownerOf(1) === walletArray[i].address) {
        console.log(`Check #${i} is true`)
      } else {
        console.log(`Check #${i} is true`)
      }
    }

  })
})






