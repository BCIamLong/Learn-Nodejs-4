/* eslint-disable */
import { showAlert } from './alert';

const loginForm = document.querySelector('.login-form .form');
export const login = async (email, password) => {
  // const url = 'http://127.0.0.1:3000/api/v1/users/login';
  // const data = {
  //   email,
  //   password,
  // };
  // * Use AJAX from Javascript support
  // const res = await fetch(url, {
  //   method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //   mode: 'cors', // no-cors, *cors, same-origin
  //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  //   credentials: 'same-origin', // include, *same-origin, omit
  //   headers: {
  //     'Content-Type': 'application/json',
  //     // 'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: JSON.stringify(data),
  // });
  // const check = await res.json();
  // console.log(check);
  // if (check.status === 'success') {
  //   alert('Login success');
  // } else {
  //   alert(check.message);
  // }
  // * but we can use the library about AJAX which is called axios
  // * a plug point for this axios that when the request AJAX is error it'll throw error for us and we can catch it to handle
  // ! we can also us try catch here but it's only work for modern browser and if we want it's work for many browser especially for old browser we can use then() catch()
  await axios({
    method: 'POST',
    url: '/api/v1/users/login',
    data: { email, password },
  })
    // .then(res => res.json())
    .then(res => {
      loginForm.classList.add('form--inactive');
      // console.log(res);
      if (res.data.status === 'success') {
        // alert('Login successfully');
        showAlert('success', 'Login successfully');
        window.setTimeout(() => {
          // window.location.href = '/';
          // * we can use 1 of two way to redirect to other page
          location.assign('/');
        }, 1000);
        window.setTimeout(() => {
          loginForm.classList.remove('form--inactive');
        }, 3000);
      }
    })
    .catch(err => {
      // console.log(err.response.data);
      // alert(err.response.data.message);
      showAlert('error', err.response.data.message);
    });
};

// * we will logout with our logout from API
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    // console.log(res);
    // * we also need to reload page why? because we are codding  in front-end so we can't use render in here right, and reload page will send request with the empty the cookie to server and isLoginIn router will take it and not return user => in this time user is undefined and then the login in our pug file will check and display login and signup buttons
    if (res.data?.status === 'success') {
      showAlert('success', 'Logout successfully');
      window.setTimeout(() => {
        // * we can use reload page here with: location.reload(true), set option true to also force reload server, if we don't have this it's only reload with the cache which it's storage in the first time run and of course the page will not change and so it's important to set option true here
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    // * usually we don't have error when we logout but to ensure like in the case we don't have the internet we also want to show nice notification for user
    // console.log(err);
    showAlert('error', err.response?.data.message);
  }
};
