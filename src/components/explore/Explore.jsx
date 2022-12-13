import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./explore.css";

const Explore = (props) => {
  const [getItems, setItems] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState(false);
  const [royaltyReceiver, setRoyaltyReceiver] = useState(0);
  const [royaltyPercent, setRoyaltyPercent] = useState(0);
  const mrktContract = props.marketplace;
  const nftContract = props.nft;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const loadMarketplaceItems = async () => {
    setLoading(true);
    if (mrktContract && nftContract) {
      const n = await nftContract.name();
      setName(n);
      const nftID = await mrktContract.getNFTCount();
      let items = [];
      for (let i = 1; i <= Number(nftID); i++) {
        const nft = await mrktContract.IDtoItem(i);
        if (
          nft.itemID > 0 &&
          !nft.sold &&
          nft.whitelistAddress == zeroAddress
        ) {
          const uri = await nftContract.tokenURI(nft.tokenID);
          const response = await fetch(uri);
          const metadata = await response.json();
          const totalPrice = await mrktContract.getTotalPrice(
            Number(nft.itemID)
          );
          const rr = await nftContract.getRoyaltyReceiver(nft.tokenID);
          const rprc = await nftContract.getRoyaltyPercent(nft.tokenID);
          if (rr != "0x0000000000000000000000000000000000000000") {
            setRoyaltyReceiver(rr);
          }
          setRoyaltyPercent(rprc);
          items.push({
            totalPrice,
            itemId: nft.itemID,
            seller: nft.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
          });
        }
      }
      setItems(items);
    }
    setLoading(false);
  };

  const buyMarketItem = async (item) => {
    const order = await mrktContract.purchaseItem(item.itemId, {
      value: item.totalPrice,
    });
    loadMarketplaceItems();
    return order;
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, [props.marketplace]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {getItems.length > 0 ? (
        <div className="explore-container">
          {getItems.map((item, index) => (
            <div key={index} className="explore-card">
              <div className="featured-card">
                {royaltyReceiver ? (
                  <div className="buynow-action">
                    {Number(royaltyPercent)}% royalty
                  </div>
                ) : (
                  <></>
                )}
                <div className="ex-img-wrap">
                  <img className="feat-img" src={item.image} alt="" />
                </div>

                <div className="feat-info-wrap">
                  <div className="pfp-info-wrap">
                    <div>
                      <div>
                        <strong>{item.name}</strong>
                      </div>
                      <div>{name}</div>
                      {royaltyReceiver ? (
                        <div>
                          <small>
                            Royalty Receiver:{" "}
                            {royaltyReceiver.slice(0, 2) +
                              "..." +
                              royaltyReceiver.slice(38, 43)}
                          </small>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div>
                    <div>Item ID: #{Number(item.itemId)}</div>
                  </div>
                </div>
                <div>
                  <button
                    className="explore-buy-btn"
                    onClick={(e) => buyMarketItem(item)}
                  >
                    Buy For{" "}
                    {ethers.utils.formatEther(
                      Number(item.totalPrice).toString()
                    )}{" "}
                    ETH
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No items to display</div>
      )}
    </div>
  );
};

export default Explore;
