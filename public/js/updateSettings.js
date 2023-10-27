/* eslint-disable */

import { showAlert } from './alert';

// * so because update data and password is do exactly the same thing so we will change this function to can use for both update password and data
// * to do that we will pass the options object which contains all data and type of this update
export const updateUserDataSettings = async options => {
  // ! we can also use parameter likeL (type, data) it's handy more
  try {
    // let res;
    // if (options.type === 'data') {
    //   res = await axios({
    //     method: 'PATCH',
    //     url: 'http://127.0.0.1:3000/api/v1/users/me',
    //     data: { name: options.name, email: options.email },
    //   });
    // }
    // if (options.type === 'password') {
    //   res = await axios({
    //     method: 'PATCH',
    //     url: 'http://127.0.0.1:3000/api/v1/users/update-current-password',
    //     data: {
    //       currentPassword: options.currentPassword,
    //       password: options.password,
    //       passwordConfirm: options.passwordConfirm,
    //     },
    //   });
    // }
    // * because update lost some time so we can show some notify meaningful in this case like loading icon, loading message....
    const btn = document.querySelector(
      `.form-user-${options.type === 'data' ? 'data' : 'settings'} .btn`,
    );
    showAlert('success', `Update ${options.type.toUpperCase()} loading...`);
    btn.setAttribute('disabled', '');
    btn.innerHTML = 'Updating';
    const url =
      options.type === 'data' ? '/api/v1/users/me' : '/api/v1/users/update-current-password';
    const res = await axios({
      method: 'PATCH',
      url,
      data: options.data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Update your ${options.type.toUpperCase()} successfully`);
      // window.setTimeout(() => location.reload(true), 1000);
      if (options.type === 'data') return window.setTimeout(() => location.reload(true), 1000);
      // * in this case when we update password we don't have anything to show user after we update password therefore we don't need to reload page to get data
      // * and we only clear inputs that's it
      // * but in real world we see that when we update anything it's not reload page because when we use AJAX or use React, Vue it's always have data send back and we only take this data and display not to need go to server side to get data
      btn.innerHTML = `Save ${options.type === 'data' ? 'settings' : 'password'}`;
      btn.removeAttribute('disabled');
      document.querySelector('#password-current').value = '';
      document.querySelector('#password').value = '';
      document.querySelector('#password-confirm').value = '';
    }
  } catch (err) {
    const btn = document.querySelector(
      `.form-user-${options.type === 'data' ? 'data' : 'settings'} .btn`,
    );
    btn.innerHTML = `Save ${options.type === 'data' ? 'settings' : 'password'}`;
    btn.removeAttribute('disabled');
    showAlert('error', err.response.data.message);
  }
};

// export const updateUserData = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/me',
//       data: { name, email },
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'Update your data successfully');
//       window.setTimeout(() => location.reload(true), 1000);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
