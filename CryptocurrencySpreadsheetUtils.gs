/**
    Cryptocurrency Spreadsheet Utils
    
    v0.1
    6/29/2017
    by Brad Jasper
    
    A simple set of utilites for working with cryptocurrencies in Google Sheets.
        
    To use, simple add =getCoinPrice("SYMBOL") in a row. For example, Bitcoin would be
    
        =getCoinPrice("BTC")
        
    Ethereum would be

        =getCoinPrice("ETH")
        
    Litecoin would be
    
        =getCoinPrice("LTC")       
     
    Almost every crypto currency should work because data is fetched from coinmarketcap.com API,
    which has many and updates pretty regularly. Data is cached for 25 minutes.
        
    Requires Google Sheets permission because we're requesting an external service.
    A version without this permission exists here, but doesn't cache and is much slower:
        https://docs.google.com/spreadsheets/d/170ps_Xpo3fVsVi8niV8rSLJnZ5GFsV7GCEx6IpHNvtA/edit?usp=sharing
        
    You should use this version if you can as it's much friendlier to coinmarketcap.com's API.
    
    Questions or comments email contact@bradjasper.com or @bradjasper
    
    Happy trading—be safe out there!
**/

var cache = CacheService.getScriptCache();
var exchangeUrl = "https://api.coinmarketcap.com/v1/ticker/";

function getCoinPrice(symbol) {
  var coin = getCoinInfo(symbol);
  if (!coin) {
    return null;
  }
  return parseFloat(coin.price_usd);
}

function getCoinInfo(symbol) {
  if (!symbol) return;
  
  Logger.log("Getting coin info for " + symbol);
  
  var coin = getCachedCoin(symbol);
  if (!coin) {
    Logger.log("No cached cound info found for " + symbol);
    updateExchangeCache();
  }
  
  coin = getCachedCoin(symbol);
  if (!coin) {
    Logger.log("Unable to find information for " + symbol + " ...something is wrong with the script or service");
    return null;
  }
  
  return coin;
}

function getCachedCoin(symbol) {
  var cached = cache.get(symbol);
  if (cached) {
    try {
      var coin = JSON.parse(cached);
      return coin;
    } catch (e) {
      Logger.log("Error while parsing coin " + symbol + " from cache");
    }
  }  
}

function updateExchangeCache() {
  Logger.log("Updating exchange cached information");
 
  var response = UrlFetchApp.fetch(exchangeUrl);
  var content = response.getContentText();
  try {
    var data = JSON.parse(content);
  } catch (e) {
    Logger.log("Error while parsing response from exchange: " + content);
  }

  var cachedCoins = {};
  for (var i in data) {
    var coin = data[i];
    cachedCoins[coin.symbol] = JSON.stringify(coin);
  }
  
  if (cachedCoins) {
    Logger.log("Caching " + Object.keys(cachedCoins).length + " exchange prices");
    cache.putAll(cachedCoins);
  } else {
    Logger.log("No cached coins found");
  }
}
