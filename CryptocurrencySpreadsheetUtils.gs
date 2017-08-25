/**
    Cryptocurrency Financial Tracker Utils

    v0.2 - 8/24/2017 - Migrated API to coinbin.org
    v0.1 - 6/29/2017 - Started project
    
    by Brad Jasper
    
    A simple set of utilites for working with cryptocurrencies in Google Sheets.
        
    To use, simple add =getCoinPrice("SYMBOL") in a row. For example, Bitcoin would be
    
        =getCoinPrice("BTC")
        
    Ethereum would be

        =getCoinPrice("ETH")
        
    Litecoin would be
    
        =getCoinPrice("LTC")       
     
    Almost every crypto currency should work because data is fetched from coinbin.org API,
    which has many and updates pretty regularly. Data is cached for 25 minutes.
        
    Questions or comments email contact@bradjasper.com or @bradjasper
    
    Happy trading—be safe out there!
**/

var cache = CacheService.getScriptCache();
var exchangeUrl = "https://coinbin.org/coins";

function getCoinPrice(symbol) {
  if (!symbol) return null;
  
  var coin = getCoinInfo(symbol.toLowerCase());
  if (!coin) {
    return null;
  }
  return parseFloat(coin.usd);
}

function getCoinInfo(symbol) {
  if (!symbol) return;
  
  cache.remove(symbol);
  
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

Array.prototype.chunk = function ( n ) {
    if ( !this.length ) {
        return [];
    }
    return [ this.slice( 0, n ) ].concat( this.slice(n).chunk(n) );
};

function updateExchangeCache() {
  Logger.log("Updating exchange cached information");
 
  var response = UrlFetchApp.fetch(exchangeUrl);
  var content = response.getContentText();
  
  try {
    var data = JSON.parse(content);
  } catch (e) {
    Logger.log("Error while parsing response from exchange: " + content);
  }
  
  var coins = data.coins;
  
  if (coins) {
    
    Logger.log("Caching " + Object.keys(coins).length + " exchange prices");
    
    var cachedCoins = {};
    for (var ticker in coins) {
      cachedCoins[ticker] = JSON.stringify(coins[ticker]);
    }
    
    cache.putAll(cachedCoins);
  } else {
    Logger.log("No cached coins found");
  }
}
