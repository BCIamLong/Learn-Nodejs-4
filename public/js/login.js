/* eslint-disable*/
'use strict';

const formEl = document.querySelector('.form');

const login = async (email, password) => {
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
    url: 'http://127.0.0.1:3000/api/v1/users/login',
    data: { email, password },
  })
    // .then(res => res.json())
    .then(res => {
      // console.log(res);
      if (res.data.status === 'success') {
        alert('Login successfully');
        window.setTimeout(() => {
          // window.location.href = '/';
          // * we can use 1 of two way to redirect to other page
          location.assign('/');
        }, 1500);
      }
    })
    .catch(err => {
      // console.log(err.response.data);
      alert(err.response.data.message);
    });
};

formEl.addEventListener('submit', function (e) {
  e.preventDefault();
  // * with input element we can use .value to get value we enter in inputs
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  // console.log(email, password);
  login(email, password);
});
