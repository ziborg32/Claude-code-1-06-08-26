const PRODUCT = {
  id: 'hacker-promo',
  priceStars: Number(process.env.PRICE_STARS) || 2500,
  priceUsd: Number(process.env.PRICE_USD) || 5,
};

module.exports = { PRODUCT };
