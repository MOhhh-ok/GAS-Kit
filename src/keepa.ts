const KEEPA_DOMAINS = {
  '.com': 1,
  '.co.uk': 2,
  '.de': 3,
  '.fr': 4,
  '.co.jp': 5,
  '.ca': 6,
  '.it': 8,
  '.es': 9,
  '.in': 10,
};

const KEEPA_CSVS = {
  AMAZON: 0, // Amazon price history
  NEW: 1, // Marketplace New price history
  USED: 2, // Marketplace Used price history
  SALES: 3, // Sales Rank history
  LISTPRICE: 4, // List Price history
  COLLECTIBLE: 5, // Collectible price history
  REFURBISHED: 6, // Refurbished price history
  NEW_FBM_SHIPPING: 7, // 3rd party New price history including shipping costs, FBM
  LIGHTNING_DEAL: 8, // Lightning Deal price history
  WAREHOUSE: 9, // Amazon Warehouse price history
  NEW_FBA: 10, // Lowest 3rd party New offer fulfilled by Amazon price history
  COUNT_NEW: 11, // New offer count history
  COUNT_USED: 12, // Used offer count history
  COUNT_REFURBISHED: 13, // Refurbished offer count history
  COUNT_COLLECTIBLE: 14, // Collectible offer count history
  EXTRA_INFO_UPDATES: 15, // History of past updates to offers-parameter related data
  RATING: 16, // The product’s rating history
  COUNT_REVIEWS: 17, // The product’s review count history
  BUY_BOX_SHIPPING: 18, // The New buy box price history, including shipping costs
  USED_NEW_SHIPPING: 19, // “Used - Like New” price history, including shipping costs
  USED_VERY_GOOD_SHIPPING: 20, // “Used - Very Good” price history, including shipping costs
  USED_GOOD_SHIPPING: 21, // “Used - Good” price history, including shipping costs
  USED_ACCEPTABLE_SHIPPING: 22, // “Used - Acceptable” price history, including shipping costs
  COLLECTIBLE_NEW_SHIPPING: 23, // “Collectible - Like New” price history, including shipping costs
  COLLECTIBLE_VERY_GOOD_SHIPPING: 24, // “Collectible - Very Good” price history, including shipping costs
  COLLECTIBLE_GOOD_SHIPPING: 25, // “Collectible - Good” price history, including shipping costs
  COLLECTIBLE_ACCEPTABLE_SHIPPING: 26, // “Collectible - Acceptable” price history, including shipping costs
  REFURBISHED_SHIPPING: 27, // Refurbished price history, including shipping costs
  EBAY_NEW_SHIPPING: 28, // Lowest new price on eBay, including shipping costs
  EBAY_USED_SHIPPING: 29, // Lowest used price on eBay, including shipping costs
  TRADE_IN: 30, // Trade-in price history
  RENTAL: 31, // Rental price history
  BUY_BOX_USED_SHIPPING: 32, // The Used buy box price history, including shipping costs
  PRIME_EXCL: 33 // Price history of the lowest Prime exclusive New offer
};



class Keepa {
  constructor() {
    this.key = '';//!!TODO
  }

  /**
   * Keepa time minutesを日付オブジェクトに変換
   */
  keepaTimeToDate(keepaTime = 0) {
    return new Date(((keepaTime - 0) + 21564000) * 60000);
  }

  getTokensLeft() {
    return this.tokensLeft;
  }

  /**
   * 商品情報を取得。asinsの最大は100件
   */
  requestProducts(asins = []) {
    const payload = {
      key: this.key,
      asin: asins.filter(v => v).join(','),
      domain: `${KEEPA_DOMAINS[Settings['ドメイン']]}`, //1:com 2:co.uk 3:de 4:fr 5:co.jp 6:ca 8:it 9:es 10:in
      days: '1', //取得範囲日数
      stats: `${Settings['日数']}`, //指定期間(日)の統計を取得する。期間で指定も可能：'2019-10-20,2019-12-24'
      rating: '0', //1:レビューレート・個数を取得する(+1トークン) 0:取得しない
      buybox: '0', //1:カート価格を取得する(+2トークン)　0:取得しない
      //offers: '20' //20-100:出品データを取得する(6トークン/10件)。 数字は最大取得する件数。offersを指定した場合、rating、buyboxが指定してあってもトークンを消費しない
    };

    Logger.log(JSON.stringify(payload, null, 2));

    /** 同期処理 */
    const response = UrlFetchApp.fetch('https://api.keepa.com/product', { method: 'post', payload: payload });

    const json = JSON.parse(response.getContentText());
    this.tokensLeft = json.tokensLeft;

    if (json.error) {
      throw new Error(json.error.message
        + '\n残りトークン:' + json.tokensLeft
        + '\n' + json.refillRate + '補充まであと:' + json.refillIn + 'ms'
      );
    }

    return json.products;
  }

  /**
   * オブジェクトを変換
   */
  mkPObj(p) {
    if (!p) {
      return null;
    }
    const last = (arr) => {
      if (!arr) { return 0; }
      const result = arr[arr.length - 1];
      return result > 0 ? result : 0;
    }

    const csv = p.csv || [];
    const stats = p.stats || [];
    const avg = stats.avg || [];

    const result = {
      '商品名': p.title,
      'ASIN': p.asin,
      'JAN': (p.eanList || [''])[0],
      '定価': '不明',
      '型式': p.model,
      'レビュー': last(csv[KEEPA_CSVS.RATING]) / 10,
      'レビュー数': last(csv[KEEPA_CSVS.RATING]),
      'カテゴリ': p.categoryTree.map(c => c.name).join('・'),
      'FBA手数料': (p.fbaFees || {}).pickAndPackFee || '',
      'ブランド': p.brand,
      '登録日': p.publicationDate,
      '発売日': p.releaseDate,

      '取得日時': new Date(),
      '画像': '=IMAGE("https://images-na.ssl-images-amazon.com/images/I/' + p.imagesCSV.split(',')[0] + '")',
      // 'Amazonチャート': `=IMAGE("${Charts.amazonURL(p.asin)}",2)`,
      // '楽天チャート': `=IMAGE("${Charts.rakutenURL((p.eanList||[''])[0])}",2)`,

      // 以下使わない
      'メーカー': p.manufacturer,
      '商品グループ': p.productGroup,
      '品番': p.partNumber,
      '装丁': p.binding,
      '色': p.color,
      'サイズ': p.size,
      '梱包サイズ': `${p.packageWidth}x${p.packageLength}x${p.packageHeight}`,
      '梱包重量': `${p.packageWeight}g`,
      '梱包量': `${p.packageQuantity}`,
      '商品サイズ': `${p.itemWidth}x${p.itemLength}x${p.itemHeight}`,
      '商品重量': `${p.itemWeight}g`,
    };

    for (let [key, idx] of Object.entries({
      '順位': KEEPA_CSVS.SALES,
      '新品': KEEPA_CSVS.NEW,
      '中古': KEEPA_CSVS.USED,
      'アマゾン': KEEPA_CSVS.AMAZON,
      'カート': KEEPA_CSVS.BUY_BOX_SHIPPING,
      '新品数': KEEPA_CSVS.COUNT_NEW,
      '中古数': KEEPA_CSVS.COUNT_USED,
    })) {
      result[key + 'NOW'] = stats.current[idx];
      result[key + 'AVG30日'] = stats.avg30[idx];
      result[key + 'AVG90日'] = stats.avg90[idx];
      result[key + 'AVG180日'] = stats.avg180[idx];

      const now = stats.current[idx];
      const a30 = stats.avg30[idx];
      const a90 = stats.avg90[idx];
      result[key + 'DROP%30日'] = Math.round((a30 - now) / a30 * 100) / 100;
      result[key + 'DROP%90日'] = Math.round((a90 - now) / a90 * 100) / 100;
    };

    result.ALL = JSON.stringify(result, null, 2);

    return result;
  }
}



function keepaTest() {
  Logger.log();
}