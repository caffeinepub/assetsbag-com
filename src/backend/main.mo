import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

actor {
  public type MarketType = {
    #crypto;
    #stocks;
    #commodities;
    #fiat;
  };

  public type Asset = {
    marketType : MarketType;
    ticker : Text;
    name : Text;
  };

  public type Holding = {
    asset : Asset;
    amount : Float;
    purchasePrice : Float;
  };

  public type Portfolio = {
    holdings : [Holding];
  };

  public type UserProfile = {
    name : Text;
  };

  module Asset {
    public func compare(a1 : Asset, a2 : Asset) : Order.Order {
      Text.compare(a1.ticker, a2.ticker);
    };
  };

  let assets = Map.fromIter<Text, Asset>(
    [
      ("AAPL", { marketType = #stocks; ticker = "AAPL"; name = "Apple Inc." }),
      ("BTC", { marketType = #crypto; ticker = "BTC"; name = "Bitcoin" }),
      ("GOLD", { marketType = #commodities; ticker = "GOLD"; name = "Gold" }),
      ("USD", { marketType = #fiat; ticker = "USD"; name = "US Dollar" }),
    ].values(),
  );

  let portfolios = Map.empty<Principal, Portfolio>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPortfolio() : async Portfolio {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view portfolios");
    };

    switch (portfolios.get(caller)) {
      case (null) { { holdings = [] } };
      case (?portfolio) { portfolio };
    };
  };

  public shared ({ caller }) func addHolding(holding : Holding) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add assets");
    };

    let current = switch (portfolios.get(caller)) {
      case (null) { { holdings = [] } };
      case (?port) { port };
    };
    let newHoldings = current.holdings.concat([holding]);
    portfolios.add(caller, { holdings = newHoldings });
  };

  public query ({ caller }) func searchAssets(searchTerm : Text, marketType : MarketType) : async [Asset] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can search assets");
    };

    let term = searchTerm.toLower();
    let iter = assets.values();

    let filteredIter = iter.filter(
      func(asset) {
        (asset.marketType == marketType)
        and (
          asset.ticker.toLower().contains(#text term) or
          asset.name.toLower().contains(#text term)
        );
      }
    );

    filteredIter.toArray();
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchExternalData(url : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can fetch external data");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };
};
