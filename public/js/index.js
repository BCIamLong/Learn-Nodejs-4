/* eslint-disable */
// * so in index.js file we will import all files from other file in this folder
// * and then when we build parcel it will take all code from all files into one
import { login, logout } from './login'; // eslint-disable-line
import { signup } from './signup';
import { displayMap } from './mapbox';
import { updateUserDataSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { newResources, removeResources, updateResources } from './resources';
// import { showAlert } from './alert';

const loginForm = document.querySelector('.login-form .form');
const signupForm = document.querySelector('.signup-form .form');
const mapEl = document.querySelector('#map');
const bodyEl = document.querySelector('body');
const bookmarkBtn = document.querySelector('.btn--bookmark');
const bookTourBtn = document.querySelector('#book-tour');
const navLogoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPwdForm = document.querySelector('.form-user-settings');
const reviewForm = document.querySelector('.form-new-review');
const myReviewsForms = document.querySelectorAll('.form-my-review');

if (bodyEl?.dataset.alert !== '') showAlert('success', bodyEl?.dataset.alert, 9);

myReviewsForms?.forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const children = e.target.childNodes;
    const review = children[3].value;
    const rating = children[5].value;
    updateResources('reviews', e.target.dataset.review, { review, rating });
  });
});
reviewForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const review = document.querySelector('#review').value;
  const rating = document.querySelector('#rating').value;
  console.log(review, rating);
  newResources('reviews', { review, rating });
});

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
  // console.log(form);
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

signupForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const passwordConfirm = document.querySelector('#passwordConfirm').value;
  // console.log(email, password);
  signup({ name, email, password, passwordConfirm });
});

loginForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  // * with input element we can use .value to get value we enter in inputs
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  // console.log(email, password);
  login(email, password);
});

bookmarkBtn?.addEventListener('click', function (e) {
  e.preventDefault();
  if (!bookmarkBtn?.classList.contains('btn--green')) {
    bookmarkBtn.classList.add('btn--green');
    return newResources('bookmarks', {});
  }

  bookmarkBtn.classList.remove('btn--green');
  removeResources('bookmarks', bookmarkBtn.dataset.bookmark);
});

bookTourBtn?.addEventListener('click', function (e) {
  e.preventDefault();
  // * data-tour-id in JS we get it with dataset.tourId okay it auto convert tour-id like this format to camel case
  e.target.innerHTML = 'Processing...';
  bookTour(e.target.dataset.tourId);
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
