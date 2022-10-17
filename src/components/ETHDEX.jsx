// favorites list into one component
import "./tokenIndex.css"
import { Link } from "react-router-dom";
import { Card } from "antd";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import React, { useEffect, useState, useCallback } from "react";
import { useMoralis } from "react-moralis";
import useERC20Tokens from "hooks/useERC20Tokens";

//useMoralisQuery
function ETHDEX() {
  const { Moralis, isAuthenticated } = useMoralis();
  const { tokens } = useERC20Tokens();
  const [watchlist, setWatchlist] = useState([]);
  const [query, setQuery] = useState("");

  console.log(tokens);

  const getFavorites = useCallback(async () => {
    if (!isAuthenticated) return null;
    const user = await Moralis.User.current();
    let favorite = user.get("Favorites");
    setWatchlist(favorite);
  }, [isAuthenticated, Moralis]);

  // look at watchlist / relations and watchlistMetadata function on home page.
  const addWatchlist = useCallback(
    async (token) => {
      if (!isAuthenticated)
        return alert("You must connect your wallet to add to your watchlist");
      try {
        const user = await Moralis.User.current();
        //const favorites = user.relation("Watchlist");
        await user.addUnique("Favorites", token);
        await user.save().then(getFavorites());
      } catch (error) {
        alert("error" + error.code + error.message);
      }
    },
    [Moralis, getFavorites, isAuthenticated],
  );

  const removeWatchlist = useCallback(
    async (token) => {
      if (!isAuthenticated) return null;
      try {
        const user = await Moralis.User.current();
        console.log(user);
        await user.remove("Favorites", token);
        await user.save().then(getFavorites());
      } catch (error) {
        alert("error" + error.code + error.message);
      }
    },
    [Moralis, isAuthenticated, getFavorites],
  );

  useEffect(() => {
    getFavorites();
  }, [addWatchlist, removeWatchlist, getFavorites]);

  //const filteredTokens = () => {
  //  var search = tokens.filter((val) => {
  //    if (query == "") {
  //      return val;
  //    } else {
  //      return val.Name.toLowerCase().includes(query.toLowerCase());
  //      //  && val.Symbol.toLowerCase().includes(query.toLowerCase());
  //    }
  //  });
  //  return search;
  //};

  return (
    <div className="ETHDEX">
      <div style={{ textAlign: "center" }}>
        <input
          placeholder="Search..."
          className="searchBar"
          type="text"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <h1 className="heading">Tokens</h1>
      <div className="text">
        <span className="column1">DAO</span>
        <span className="column2">Type</span>
        <span>Price</span>
      </div>
      <div>
        {!tokens
          ? null
          : tokens
            .filter((val) => {
              if (query == "") {
                return val;
              } else {
                return val.Name.toLowerCase().includes(query.toLowerCase());
                //  && val.Symbol.toLowerCase().includes(query.toLowerCase());
              }
            })
            .map((token, index) => (
              <div className="cardContainer" key={index}>
                <Card className="daoCard">
                  <Link to={`/${token.Name}/${token.Address}`}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img className="logo" src={token.Logo} alt="noLogo" />
                      <div>
                        <h4 className="name">{token.Name}</h4>
                        <span className="symbol">{token.Symbol}</span>
                      </div>
                      <div>
                        <span className="type">
                          {token.Type == null ? "--" : token.Type}
                        </span>
                        <span className="lastPrice">
                          {token.LastPrice == null ? "--" : token.LastPrice}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {watchlist.includes(token.Address) ? (
                    <StarFilled
                      className="favorites"
                      onClick={() => removeWatchlist(token.Address)}
                    />
                  ) : (
                    <StarOutlined
                      className="favorites"
                      onClick={() => addWatchlist(token.Address)}
                    />
                  )}
                </Card>
              </div>
            ))}
      </div>
    </div>
  );
}

export default ETHDEX;
