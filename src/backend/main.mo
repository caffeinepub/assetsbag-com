import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

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

  public type FiatVPS1ValidationResult = {
    requestedUrl : Text;
    timestamp : Int;
    rawResponseBody : Text;
    validationStatus : { #valid; #invalid };
    errorMessage : ?Text;
    isTruncated : Bool;
  };

  public type FiatAssetCacheEntry = {
    timestamp : Int;
    assets : [Asset];
    expired : Bool;
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

  // Migrated Fiat asset cache
  let fiatAssetCache = Map.empty<Text, FiatAssetCacheEntry>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let MAX_BODY_SIZE : Nat = 100_000;
  var latestFiatVPS1Result : ?FiatVPS1ValidationResult = null;
  let CACHE_EXPIRY_LIMIT : Int = 4_000_000_000_000;

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

  public shared ({ caller }) func fetchFiatVPS1Data() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch FIAT VPS1 data");
    };

    let vps1Url = "http://74.208.158.232/fx_rates.json";
    let timestamp = Time.now();

    try {
      let responseBody = await OutCall.httpGetRequest(vps1Url, [], transform);

      let (storedBody, isTruncated) = if (responseBody.size() > MAX_BODY_SIZE) {
        (Text.fromArray(Array.tabulate<Char>(MAX_BODY_SIZE, func(i) { responseBody.toArray()[i] })), true);
      } else {
        (responseBody, false);
      };

      let isValid = responseBody.size() > 0;

      latestFiatVPS1Result := ?{
        requestedUrl = vps1Url;
        timestamp = timestamp;
        rawResponseBody = storedBody;
        validationStatus = if (isValid) { #valid } else { #invalid };
        errorMessage = if (isTruncated) {
          ?"Response body truncated due to size limit";
        } else if (not isValid) {
          ?"Empty response received";
        } else {
          null;
        };
        isTruncated = isTruncated;
      };

      responseBody;
    } catch (error) {
      latestFiatVPS1Result := ?{
        requestedUrl = vps1Url;
        timestamp = timestamp;
        rawResponseBody = "";
        validationStatus = #invalid;
        errorMessage = ?("HTTP request failed: " # Error.message(error));
        isTruncated = false;
      };
      throw error;
    };
  };

  public query ({ caller }) func getFiatVPS1ValidationResult() : async ?FiatVPS1ValidationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access FIAT VPS1 validation results");
    };
    latestFiatVPS1Result;
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

  // Caching for mapped Fiat VPS1 data
  public shared ({ caller }) func cacheFiatVPS1Data(cacheId : Text, assets : [Asset]) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cache fiat data");
    };
    let timestamp = Time.now();
    let cacheEntry : FiatAssetCacheEntry = {
      timestamp;
      assets;
      expired = false;
    };
    fiatAssetCache.add(cacheId, cacheEntry);
    true;
  };

  public query ({ caller }) func getCachedFiatAssets(cacheId : Text) : async ?FiatAssetCacheEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access cached fiat assets");
    };
    fiatAssetCache.get(cacheId);
  };

  // Invalidate all from frontend-marked entries
  public shared ({ caller }) func expireFiatAssetCacheEntries(cacheIds : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can expire cache entries");
    };
    let now = Time.now();
    var expiredCount = 0;

    for (cacheId in cacheIds.values()) {
      switch (fiatAssetCache.get(cacheId)) {
        case (?entry) {
          if ((now - entry.timestamp) > CACHE_EXPIRY_LIMIT) {
            let newExpiredEntry = {
              entry with expired = true;
            };
            fiatAssetCache.add(cacheId, newExpiredEntry);
            expiredCount += 1;
          };
        };
        case (null) {};
      };
    };
    expiredCount;
  };

  public query ({ caller }) func getFiatCacheMetaData() : async [(Text, Int, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access cache metadata");
    };
    fiatAssetCache.toArray().map(
      func((cacheId, entry)) {
        (cacheId, entry.timestamp, entry.expired);
      }
    );
  };
};
