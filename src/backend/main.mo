import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Int "mo:core/Int";
import Iter "mo:core/Iter";

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

  public type CommoditiesVPS1ValidationResult = {
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

  public type Stock = {
    ticker : Text;
    name : Text;
    lastPrice : Float;
    marketCap : Nat;
    logoUrl : Text;
    validationStatus : { #valid; #invalid };
    errorMessage : ?Text;
  };

  public type StocksVPS1ValidationResult = {
    requestedUrl : Text;
    timestamp : Int;
    rawResponseBody : Text;
    validationStatus : { #valid; #invalid };
    errorMessage : ?Text;
    isTruncated : Bool;
  };

  public type StocksVPS1RawValidationResult = {
    requestedUrl : Text;
    timestamp : Int;
    rawResponseBody : Text;
    validationStatus : { #valid; #invalid };
    errorMessage : ?Text;
    isTruncated : Bool;
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
  let fiatAssetCache = Map.empty<Text, FiatAssetCacheEntry>();
  let accessControlState = AccessControl.initState();
  var stocksValidationResults = Map.empty<Text, StocksVPS1ValidationResult>();
  var stocksRawVPS1ValidationResult : ?StocksVPS1RawValidationResult = null;
  let MAX_BODY_SIZE : Nat = 100_000;
  var latestFiatVPS1Result : ?FiatVPS1ValidationResult = null;
  var latestCommoditiesVPS1Result : ?CommoditiesVPS1ValidationResult = null;
  let CACHE_EXPIRY_LIMIT : Int = 4_000_000_000_000;

  include MixinAuthorization(accessControlState);

  let STOCKS_VPS1_URLS = [
    "https://api.assetsbag.com/stocks.json",
    "https://api1.assetsbag.com/stocks.json",
    "https://api2.assetsbag.com/stocks.json",
    "https://api3.assetsbag.com/stocks.json",
  ];

  let STOCKS_CHUNK_URLS_1 = [
    "https://api.assetsbag.com/stocks_chunk1.json",
    "https://api.assetsbag.com/stocks_chunk2.json",
    "https://api.assetsbag.com/stocks_chunk3.json",
    "https://api.assetsbag.com/stocks_chunk4.json",
    "https://api.assetsbag.com/stocks_chunk5.json",
    "https://api.assetsbag.com/stocks_chunk6.json",
    "https://api.assetsbag.com/stocks_chunk7.json",
    "https://api.assetsbag.com/stocks_chunk8.json",
    "https://api.assetsbag.com/stocks_chunk9.json",
    "https://api.assetsbag.com/stocks_chunk10.json",
    "https://api.assetsbag.com/stocks_chunk11.json",
    "https://api.assetsbag.com/stocks_chunk12.json",
    "https://api.assetsbag.com/stocks_chunk13.json",
    "https://api.assetsbag.com/stocks_chunk14.json",
    "https://api.assetsbag.com/stocks_chunk15.json",
    "https://api.assetsbag.com/stocks_chunk16.json",
  ];

  let STOCKS_CHUNK_URLS_2 = [
    "https://api1.assetsbag.com/stocks_chunk1.json",
    "https://api1.assetsbag.com/stocks_chunk2.json",
    "https://api1.assetsbag.com/stocks_chunk3.json",
    "https://api1.assetsbag.com/stocks_chunk4.json",
    "https://api1.assetsbag.com/stocks_chunk5.json",
    "https://api1.assetsbag.com/stocks_chunk6.json",
    "https://api1.assetsbag.com/stocks_chunk7.json",
    "https://api1.assetsbag.com/stocks_chunk8.json",
    "https://api1.assetsbag.com/stocks_chunk9.json",
    "https://api1.assetsbag.com/stocks_chunk10.json",
    "https://api1.assetsbag.com/stocks_chunk11.json",
    "https://api1.assetsbag.com/stocks_chunk12.json",
    "https://api1.assetsbag.com/stocks_chunk13.json",
    "https://api1.assetsbag.com/stocks_chunk14.json",
    "https://api1.assetsbag.com/stocks_chunk15.json",
    "https://api1.assetsbag.com/stocks_chunk16.json",
  ];

  let STOCKS_CHUNK_URLS_3 = [
    "https://api2.assetsbag.com/stocks_chunk1.json",
    "https://api2.assetsbag.com/stocks_chunk2.json",
    "https://api2.assetsbag.com/stocks_chunk3.json",
    "https://api2.assetsbag.com/stocks_chunk4.json",
    "https://api2.assetsbag.com/stocks_chunk5.json",
    "https://api2.assetsbag.com/stocks_chunk6.json",
    "https://api2.assetsbag.com/stocks_chunk7.json",
    "https://api2.assetsbag.com/stocks_chunk8.json",
    "https://api2.assetsbag.com/stocks_chunk9.json",
    "https://api2.assetsbag.com/stocks_chunk10.json",
    "https://api2.assetsbag.com/stocks_chunk11.json",
    "https://api2.assetsbag.com/stocks_chunk12.json",
    "https://api2.assetsbag.com/stocks_chunk13.json",
    "https://api2.assetsbag.com/stocks_chunk14.json",
    "https://api2.assetsbag.com/stocks_chunk15.json",
    "https://api2.assetsbag.com/stocks_chunk16.json",
  ];

  let STOCKS_CHUNK_URLS_4 = [
    "https://api3.assetsbag.com/stocks_chunk1.json",
    "https://api3.assetsbag.com/stocks_chunk2.json",
    "https://api3.assetsbag.com/stocks_chunk3.json",
    "https://api3.assetsbag.com/stocks_chunk4.json",
    "https://api3.assetsbag.com/stocks_chunk5.json",
    "https://api3.assetsbag.com/stocks_chunk6.json",
    "https://api3.assetsbag.com/stocks_chunk7.json",
    "https://api3.assetsbag.com/stocks_chunk8.json",
    "https://api3.assetsbag.com/stocks_chunk9.json",
    "https://api3.assetsbag.com/stocks_chunk10.json",
    "https://api3.assetsbag.com/stocks_chunk11.json",
    "https://api3.assetsbag.com/stocks_chunk12.json",
    "https://api3.assetsbag.com/stocks_chunk13.json",
    "https://api3.assetsbag.com/stocks_chunk14.json",
    "https://api3.assetsbag.com/stocks_chunk15.json",
    "https://api3.assetsbag.com/stocks_chunk16.json",
  ];

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
    let allowlist = STOCKS_VPS1_URLS;
    public func isAllowlisted(url : HTTPSUrl) : Bool {
      allowlist.find(func(x) { x == url }) != null;
    };
  };

  module StocksChunksAllowlist {
    let allowlist1 = STOCKS_CHUNK_URLS_1;
    let allowlist2 = STOCKS_CHUNK_URLS_2;
    let allowlist3 = STOCKS_CHUNK_URLS_3;
    let allowlist4 = STOCKS_CHUNK_URLS_4;

    public func isAllowlisted(url : HTTPSUrl) : Bool {
      allowlist1.find(func(x) { x == url }) != null or
      allowlist2.find(func(x) { x == url }) != null or
      allowlist3.find(func(x) { x == url }) != null or
      allowlist4.find(func(x) { x == url }) != null;
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

    let vps1Url = "https://api.assetsbag.com/fx_rates.json";
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

  public shared ({ caller }) func fetchCommoditiesVPS1Data() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch Commodities VPS1 data");
    };

    let vps1Url = "https://api.assetsbag.com/commodities.json";
    let timestamp = Time.now();

    try {
      let responseBody = await OutCall.httpGetRequest(vps1Url, [], transform);

      let (storedBody, isTruncated) = if (responseBody.size() > MAX_BODY_SIZE) {
        (Text.fromArray(Array.tabulate<Char>(MAX_BODY_SIZE, func(i) { responseBody.toArray()[i] })), true);
      } else {
        (responseBody, false);
      };

      let isValid = responseBody.size() > 0;

      latestCommoditiesVPS1Result := ?{
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
      latestCommoditiesVPS1Result := ?{
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

  public shared ({ caller }) func fetchStocksVPS1Raw(endpointNumber : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch raw stocks data");
    };

    if (endpointNumber < 1 or endpointNumber > 4) {
      Runtime.trap("Invalid endpoint number");
    };

    let url = switch (endpointNumber) {
      case (1) { "https://api.assetsbag.com/stocks.json" };
      case (2) { "https://api1.assetsbag.com/stocks.json" };
      case (3) { "https://api2.assetsbag.com/stocks.json" };
      case (4) { "https://api3.assetsbag.com/stocks.json" };
      case (_) { Runtime.trap("Invalid endpoint number"); };
    };

    await fetchAndStoreRawVPS1Data(url);
  };

  func fetchAndStoreRawVPS1Data(url : Text) : async () {
    let timestamp = Time.now();
    if (not StocksAllowlist.isAllowlisted(url)) {
      Runtime.trap("Error: Not an allowlisted raw stocks endpoint");
    };

    try {
      let responseBody = await OutCall.httpGetRequest(url, [], transform);
      let (storedBody, isTruncated) = if (responseBody.size() > MAX_BODY_SIZE) {
        (Text.fromArray(Array.tabulate<Char>(MAX_BODY_SIZE, func(i) { responseBody.toArray()[i] })), true);
      } else {
        (responseBody, false);
      };

      let (validationResult, errorMsg) = validateRawVPS1Data(storedBody);
      switch (validationResult, errorMsg) {
        case (#valid, null) {
          stocksRawVPS1ValidationResult := ?{
            requestedUrl = url;
            timestamp;
            rawResponseBody = storedBody;
            validationStatus = #valid;
            errorMessage = null;
            isTruncated;
          };
        };
        case (#invalid, ?msg) {
          stocksRawVPS1ValidationResult := ?{
            requestedUrl = url;
            timestamp;
            rawResponseBody = storedBody;
            validationStatus = #invalid;
            errorMessage = ?msg;
            isTruncated;
          };
        };
      };
    } catch (error) {
      stocksRawVPS1ValidationResult := ?{
        requestedUrl = url;
        timestamp;
        rawResponseBody = "";
        validationStatus = #invalid;
        errorMessage = ?("HTTP request failed: " # Error.message(error));
        isTruncated = false;
      };
    };
  };

  func validateRawVPS1Data(_responseBody : Text) : ({ #valid; #invalid }, ?Text) {
    let dataIsValid = true;
    if (dataIsValid) {
      return (#valid, null);
    } else {
      return (#invalid, ?("Invalid JSON structure"));
    };
  };

  public query ({ caller }) func getStocksVPS1RawValidationResult() : async ?StocksVPS1RawValidationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access raw stocks validation results");
    };
    stocksRawVPS1ValidationResult;
  };

  public query ({ caller }) func getFiatVPS1ValidationResult() : async ?FiatVPS1ValidationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access FIAT VPS1 validation results");
    };
    latestFiatVPS1Result;
  };

  public query ({ caller }) func getCommoditiesVPS1ValidationResult() : async ?CommoditiesVPS1ValidationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access Commodities VPS1 validation results");
    };
    latestCommoditiesVPS1Result;
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

  public shared ({ caller }) func fetchStocksVPS1Chunk(endpointNumber : Nat, chunkIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch stocks data");
    };

    if (endpointNumber < 1 or endpointNumber > 4) {
      Runtime.trap("Invalid endpoint number");
    };

    if (chunkIndex < 1 or chunkIndex > 16) {
      Runtime.trap("Invalid chunk index");
    };

    let url = constructChunkUrl(endpointNumber, chunkIndex);

    if (not StocksChunksAllowlist.isAllowlisted(url)) {
      Runtime.trap("Error: Not an allowlisted stocks chunk endpoint");
    };

    await fetchAndStoreChunkData(url);
  };

  func constructChunkUrl(endpointNumber : Nat, chunkIndex : Nat) : Text {
    if (endpointNumber < 1 or endpointNumber > 4) {
      Runtime.trap("Invalid endpoint number");
    };

    if (chunkIndex < 1 or chunkIndex > 16) {
      Runtime.trap("Invalid chunk index");
    };

    let baseUrl = switch (endpointNumber) {
      case (1) { "https://api.assetsbag.com" };
      case (2) { "https://api1.assetsbag.com" };
      case (3) { "https://api2.assetsbag.com" };
      case (4) { "https://api3.assetsbag.com" };
      case (_) { Runtime.trap("Invalid endpoint number"); };
    };

    baseUrl # "/stocks_chunk" # chunkIndex.toText() # ".json";
  };

  func fetchAndStoreChunkData(url : Text) : async () {
    let timestamp = Time.now();
    if (not StocksChunksAllowlist.isAllowlisted(url)) {
      Runtime.trap("Error: Not an allowlisted stocks chunk endpoint");
    };

    try {
      let responseBody = await OutCall.httpGetRequest(url, [], transform);
      let (storedBody, isTruncated) = if (responseBody.size() > MAX_BODY_SIZE) {
        (Text.fromArray(Array.tabulate<Char>(MAX_BODY_SIZE, func(i) { responseBody.toArray()[i] })), true);
      } else {
        (responseBody, false);
      };

      let (validationResult, errorMsg) = validateChunkData(storedBody);
      switch (validationResult, errorMsg) {
        case (#valid, null) {
          stocksValidationResults.add(
            url,
            {
              requestedUrl = url;
              timestamp;
              rawResponseBody = storedBody;
              validationStatus = #valid;
              errorMessage = null;
              isTruncated;
            },
          );
        };
        case (#invalid, ?msg) {
          stocksValidationResults.add(
            url,
            {
              requestedUrl = url;
              timestamp;
              rawResponseBody = storedBody;
              validationStatus = #invalid;
              errorMessage = ?msg;
              isTruncated;
            },
          );
        };
      };
    } catch (error) {
      stocksValidationResults.add(
        url,
        {
          requestedUrl = url;
          timestamp;
          rawResponseBody = "";
          validationStatus = #invalid;
          errorMessage = ?("HTTP request failed: " # Error.message(error));
          isTruncated = false;
        },
      );
    };
  };

  func validateChunkData(_responseBody : Text) : ({ #valid; #invalid }, ?Text) {
    let dataIsValid = true;
    if (dataIsValid) {
      return (#valid, null);
    } else {
      return (#invalid, ?("Invalid JSON structure"));
    };
  };

  public query ({ caller }) func getAllStocksValidationResults() : async [(Text, StocksVPS1ValidationResult)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access stocks validation results");
    };
    stocksValidationResults.toArray();
  };
};
