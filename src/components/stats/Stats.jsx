import React from "react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
// import OwnedItems from '../profile/OwnedItems'
import Profile from "./Profile";
import OwnedItems from "./OwnedItems";

const Stats = (props) => {
  const [getItems, setItems] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [getWhitelistItems, setWhitelistItems] = useState([]);
  const mrktContract = props.marketplace;
  const nftContract = props.nft;
  const account = props.account;

  const loadUserItems = async () => {
    setLoading(true);
    if (nftContract && mrktContract) {
      const tokens = await nftContract.getTokenIds();
      const owned = [];
      console.log(tokens);

      for (let i = 0; i <= tokens.length; i++) {
        if (tokens[i]) {
          const uri = await nftContract.tokenURI(tokens[i]);
          console.log(uri);
          const response = await fetch(
            "https://ipfs.io/ipfs/QmeG6nAF5Dg2vjhoEb72AwbvvpHeX3yh48hqNL7yCn9fWk"
          );
          const metadata = await response.json();
          const temp = {};
          if (metadata) {
            temp["image"] = metadata.image;
            temp["name"] = metadata.name;
            temp["description"] = metadata.description;
            temp["tokenId"] = tokens[i];
          }
          owned.push(temp);
        }
      }
      setOwnedTokens(owned);
      console.log(owned);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserItems();
  }, [props.account]);

  return (
    <div>
      <div className="sec-title mg2">Items</div>
      <div className="items-main-wrap">
        <OwnedItems
          ownedTokens={ownedTokens}
          mrktContract={mrktContract}
          nftContract={nftContract}
          account={account}
        />
        <Profile
          marketplace={mrktContract}
          nft={nftContract}
          account={account}
        />
      </div>
    </div>
  );
};

export default Stats;
