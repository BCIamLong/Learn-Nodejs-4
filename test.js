// const arr = ['long', 'ha'];

// const ob = {
//   long: 123,
//   age: 29,
// };

// for (const name in ob) {
//   if (arr.indexOf(name) >= 0) {
//     delete ob[name];
//   }
// }
//--! Remove  excluded field from obQuery if obQuery constain this field
const obQuery = {
  duration: 5,
  price: 100,
  soft: true,
};
const excludedField = ['soft', 'pages', 'limit', 'fields'];
excludedField.forEach((el) => {
  if (Object.keys(obQuery).includes(el)) delete obQuery[el];
});
console.log(obQuery);
