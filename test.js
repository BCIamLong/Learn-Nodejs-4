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
// const ob = {
//   duration: {
//     lte: 5,
//   },
//   price: 1000,
// };
// console.log(Object.entries(ob));
// // const arr = [...ob];
// const propertyArr = Object.keys(ob);
// const options = ['gte', 'lte', 'gt, lt'];

// propertyArr.forEach((el) => {
//   if (ob[el].gte) {
//     ob[el].$gte = ob[el].gte;
//     delete ob[el].gte;
//   }
//   if (ob[el].lte) {
//     ob[el].$lte = ob[el].lte;
//     delete ob[el].lte;
//   }
//   if (ob[el].gt) {
//     ob[el].$gt = ob[el].gt;
//     delete ob[el].gt;
//   }
//   if (ob[el].lt) {
//     ob[el].$lt = ob[el].lt;
//     delete ob[el].lt;
//   }
// });
// propertyArr.forEach((el) => {
//   options.forEach((option) => {
//     if (ob[el].option) {
//       ob[el].$option = ob[el].option;
//       delete ob[el].option;
//     }
//   });
// });

// console.log(ob);
// const crypto = require('crypto');
// // const bcrypt = require('bcrypt');

// const token = crypto
//   .createHash('sha256')
//   .update('63a97cbb972c30860b77976582201f84f143f3fb1f05cb1cc2f295dec70c7d08')
//   .digest('hex');
// console.log(token === 'cd70560863af8787e5050423d342f9ef90c0cf4c934344e4bef8c5e5ea55e0e6');

// const mongoose = require('mongoose');

// const id = new mongoose.Types.ObjectId('5c88fa8cf4afda39709c295a');
// console.log(id);
