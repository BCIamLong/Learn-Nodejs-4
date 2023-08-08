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
// const obQuery = {
//   duration: 5,
//   price: 100,
//   soft: true,
// };
// const excludedField = ['soft', 'pages', 'limit', 'fields'];
// excludedField.forEach((el) => {
//   if (Object.keys(obQuery).includes(el)) delete obQuery[el];
// });
// console.log(obQuery);

// change gte property to $gte
const ob = {
  duration: {
    lte: 5,
  },
  price: 1000,
};
console.log(Object.entries(ob));
// const arr = [...ob];
const propertyArr = Object.keys(ob);
// const options = ['gte', 'lte', 'gt, lt'];

propertyArr.forEach((el) => {
  if (ob[el].gte) {
    ob[el].$gte = ob[el].gte;
    delete ob[el].gte;
  }
  if (ob[el].lte) {
    ob[el].$lte = ob[el].lte;
    delete ob[el].lte;
  }
  if (ob[el].gt) {
    ob[el].$gt = ob[el].gt;
    delete ob[el].gt;
  }
  if (ob[el].lt) {
    ob[el].$lt = ob[el].lt;
    delete ob[el].lt;
  }
});
// propertyArr.forEach((el) => {
//   options.forEach((option) => {
//     if (ob[el].option) {
//       ob[el].$option = ob[el].option;
//       delete ob[el].option;
//     }
//   });
// });

console.log(ob);
