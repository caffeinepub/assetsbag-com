import Map "mo:core/Map";
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

  type HTTPSUrl = Text;

  module CryptoAllowlist {
    let allowlist : [HTTPSUrl] = [
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      "https://api.coincap.io/v2/assets",
    ];
    public func isAllowlisted(url : HTTPSUrl) : Bool {
      allowlist.find(func(x) { x == url }) != null;
    };
  };
  module StocksAllowlist {
    let allowlist : [HTTPSUrl] = [
      "https://api.marketstack.com/v1/eod?access_key=YOUR_API_KEY&symbols=AAPL,GOOGL,TSLA",
      "https://api.example.com/stocks/prices",
    ];
    public func isAllowlisted(url : HTTPSUrl) : Bool {
      allowlist.find(func(x) { x == url }) != null;
    };
  };
  module FiatsAllowlist {
    let allowlist : [HTTPSUrl] = [
      "https://api.exchangeratesapi.io/latest?base=USD",
      "https://api.example.com/fiat/rates",
    ];
    public func isAllowlisted(url : HTTPSUrl) : Bool {
      allowlist.find(func(x) { x == url }) != null;
    };
  };
  module CommoditiesAllowlist {
    let allowlist : [HTTPSUrl] = [
      "https://api.example.com/commodities/prices",
      "https://api.example.com/commodities/metal_prices",
    ];
    public func isAllowlisted(url : HTTPSUrl) : Bool {
      allowlist.find(func(x) { x == url }) != null;
    };
  };

  public shared ({ caller }) func fetchCryptoData(url : HTTPSUrl) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch crypto data");
    };
    if (not (CryptoAllowlist.isAllowlisted(url))) {
      Runtime.trap("Error: Not an allowlisted HTTPS Crypto endpoint");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func fetchStocksData(url : HTTPSUrl) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch stocks data");
    };
    if (not (StocksAllowlist.isAllowlisted(url))) {
      Runtime.trap("Error: Not an allowlisted HTTPS Stocks endpoint");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func fetchFiatData(url : HTTPSUrl) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch fiat data");
    };
    if (not (FiatsAllowlist.isAllowlisted(url))) {
      Runtime.trap("Error: Not an allowlisted HTTPS Fiat endpoint");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func fetchCommoditiesData(url : HTTPSUrl) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch commodities data");
    };
    if (not (CommoditiesAllowlist.isAllowlisted(url))) {
      Runtime.trap("Error: Not an allowlisted HTTPS Commodities endpoint");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func fetchExternalData(_url : Text) : async Text {
    Runtime.trap("updateFunctionRemovedFromBackend: Function was unsafe and has been removed. Use one of the dedicated fetch functions instead: fetchCryptoData, fetchStocksData, fetchFiatData, fetchCommoditiesData");
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

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
};
