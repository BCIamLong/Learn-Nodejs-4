/* eslint-disable */
// * so in index.js file we will import all files from other file in this folder
// * and then when we build parcel it will take all code from all files into one
import { login, logout } from './login'; // eslint-disable-line
import { signup } from './signup';
import { displayMap } from './mapbox';
import { updateUserDataSettings } from './updateSettings';
// import { showAlert } from './alert';

const loginForm = document.querySelector('.login-form .form');
const signupForm = document.querySelector('.signup-form .form');
const mapEl = document.querySelector('#map');
const navLogoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPwdForm = document.querySelector('.form-user-settings');

userDataForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  // * because we don't use form event to pass data so we need to create form data with my own
  // * with form event form data will automatically create by encrypt="multipart/form-data" right but now we use API and not form event
  const form = new FormData();
  form.append('name', document.querySelector('#name').value);
  form.append('email', document.querySelector('#email').value);
  // const email = document.querySelector('#email').value;
  // const name = document.querySelector('#name').value;
  // * the axios library will got this form data and send as normal way we did before
  // * we will add new value that's photo and with file we use files to get value of file in this case it's array so we need use [0] ok
  form.append('photo', document.querySelector('#photo').files[0]);
  console.log(form);
  updateUserDataSettings({ type: 'data', data: form });
});

userPwdForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const currentPassword = document.querySelector('#password-current').value;
  const password = document.querySelector('#password').value;
  const passwordConfirm = document.querySelector('#password-confirm').value;
  // * because update lost some time so we can show some notify meaningful in this case like loading icon, loading message....
  // showAlert('success', `Update your PASSWORD loading...`);
  // document.querySelector('.btn').setAttribute('disable');

  updateUserDataSettings({
    type: 'password',
    data: { currentPassword, password, passwordConfirm },
  });

  // document.querySelector('.btn').removeAttribute('disable');
});

signupForm?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const passwordConfirm = document.querySelector('#passwordConfirm').value;
  // console.log(email, password);
  await signup({ name, email, password, passwordConfirm });
});

loginForm?.addEventListener('submit', function (e) {
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
