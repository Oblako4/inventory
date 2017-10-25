// all clothing categories: [category_id, parent_id]
// var categoriesClothing = {
//   'Clothing, Shoes & Jewelry': [1, 0],
//   'Women': [2, 1],
//   'Men': [3, 1],
//   'Girls': [4, 1],
//   'Boys': [5, 1],
//   'Baby': [6, 1],
//   'Luggage': [7, 1]
// };

let categories = [
  'Amazon Device Accessories',
  'Amazon Kindle',
  'Automotive & Powersports',
  'Baby Products (Excluding Apparel)',
  'Beauty',
  'Books',
  'Business Products (B2B)',
  'Camera & Photo',
  'Clothing & Accessories',
  'Collectible Coins',
  'Electronics (Accessories)',
  'Fine Art',
  'Grocery & Gourmet Food',
  'Handmade',
  'Health & Personal Care',
  'Historical & Advertising Collectibles',
  'Home & Garden',
  'Industrial & Scientific',
  'Jewelry',
  'Luggage & Travel Accessories',
  'Music',
  'Musical Instruments',
  'Sports Collectibles',
  'Tools & Home Improvement',
  'Personal Computers',
  'Professional Services',
  'Shoes, Handbags & Sunglasses',
  'Software & Computer Games',
  'Sports',
  'Sports Collectibles',
  'Tools & Home Improvement',
  'Toys & Games',
  'Video, DVD & Blu-Ray',
  'Video Games & Video Game Consoles',
  'Watches'
];

var categoriesParent = categories.map((e, i) => {
  return [i + 1, e, null];
});
console.log(categoriesParent);







