
const { expect } =  require("chai")


describe("marketplace", function(){
    let deployer, addr1, addr2, nft, marketplace, totalPriceinWei
    let URI = "Sample URI"
    beforeEach(async function(){
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");

        [deployer, addr1, addr2] = await ethers.getSigners();

        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy();
        
    })
    describe("Deployment", function(){
        it("Should track name and symbol of nft collection", async function(){
            expect( await nft.name()).to.equal("Delorean Codes");
            expect( await nft.symbol()).to.equal("DLRN");
        })
        it("Should track feeAccount of the marketplace", async function () {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
        })
    })

    describe("Minting NFTs", function(){
        it("Should track each minted NFT", async function(){
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenID()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
        })
    })

    describe("Making marketplace Items", function () {
        beforeEach(async function () {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })
        it("Should track created item, transfer NFT from seller to marketplace and emit event", async function (){
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, ethers.utils.parseEther((1).toString()), 1))
            .to.emit(marketplace, "Offered")
            .withArgs(1, nft.address, 1, ethers.utils.parseEther((1).toString()), addr1.address);
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            expect(await marketplace.nftID()).to.equal(1);
            const item = await marketplace.IDtoItem(1);
            expect(item.itemID).to.equal(1);
            expect(item.nft).to.equal(nft.address);
            expect(item.tokenID).to.equal(1);
            expect(item.price).to.equal(ethers.utils.parseEther((1).toString()));
            expect(item.sold).to.equal(false);
        });
    })

    describe("Purchasing marketplace Items", function() {
        let price = 2;
        beforeEach(async function (){
            await nft.connect(addr1).mint(URI);
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
            await marketplace.connect(addr1).makeItem(nft.address, 1, ethers.utils.parseEther((price).toString()), 1);
        });
        it("Should update item, pay seller, transfer NFT, charge fee, and emit event", async function(){
            const sellerInitialBal = await addr1.getBalance()
            const feeAccountInitialBal = await deployer.getBalance()
            totalPriceinWei = await marketplace.getTotalPrice(1)
            expect((await marketplace.IDtoItem(1)).sold).to.equal(false)
            await expect(marketplace.connect(addr2).purchaseItem(1, {value: totalPriceinWei}))
            .to.emit(marketplace, "Bought")
            .withArgs(
                1,
                nft.address,
                1,
                ethers.utils.parseEther((price).toString()),
                addr1.address,
                addr2.address
            )
            const sellerFinalBal = await addr1.getBalance()
            const feeAccountFinalBal = await deployer.getBalance()
            expect(Number(sellerFinalBal)).to.greaterThan(Number(sellerInitialBal))
            expect(Number(feeAccountFinalBal)).to.greaterThan(Number(feeAccountInitialBal))
            expect(await nft.ownerOf(1)).to.equal(addr2.address);
            expect((await marketplace.IDtoItem(1)).sold).to.equal(true)
        });
        it("Should fail for invalid ID, sold items when not enough ether", async function () {
            let totalPriceinWei = await marketplace.getTotalPrice(1)
            await expect(
                marketplace.connect(addr2).purchaseItem(2, { value: ethers.utils.parseEther((price).toString())})
            ).to.be.revertedWith("item does not exist");
            await expect(
                marketplace.connect(addr2).purchaseItem(0, { value: ethers.utils.parseEther((price).toString())})
            ).to.be.revertedWith("item does not exist")
            await expect(
                marketplace.connect(addr2).purchaseItem(1, { value : ethers.utils.parseEther((price).toString())})
            ).to.be.revertedWith("not enough ether sent")
            await marketplace.connect(addr2).purchaseItem(1, {value: totalPriceinWei})
            await expect(
                marketplace.connect(deployer).purchaseItem(1, {value: totalPriceinWei})
            ).to.be.revertedWith("item already sold")
        })
    })
})