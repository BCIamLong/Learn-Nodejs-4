/* eslint-disable */
// * so in index.js file we will import all files from other file in this folder
// * and then when we build parcel it will take all code from all files into one
import { login, logout } from './login'; // eslint-disable-line
import { displayMap } from './mapbox';
import { updateUserData } from './updateSettings';

const formEl = document.querySelector('.login-form .form');
const mapEl = document.querySelector('#map');
const navLogoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

userDataForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.querySelector('#email').value;
  const name = document.querySelector('#name').value;
  updateUserData(name, email);
});

formEl?.addEventListener('submit', function (e) {
  e.preventDefault();
  // * with input element we can use .value to get value we enter in inputs
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  // console.log(email, password);
  login(email, password);
});

navLogoutBtn?.addEventListener('click', function (e) {
  e.preventDefault();
  logout();
});

// const locationsData = JSON.parse(mapEl.getAttribute('data-locations'));
// * we have other way better to get data from data-locations attribute, that's technique use dataset
// * data-locations => dataset.locations(set is represent for dash -)
if (mapEl) {
  const locationsData = JSON.parse(mapEl.dataset?.locations);
  displayMap(locationsData);
}
// console.log(locationsData);
