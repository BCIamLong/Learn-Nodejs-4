/* eslint-disable */
import { showAlert } from './alert';
const signupForm = document.querySelector('.signup-form .form');
export const signup = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data,
    });
    signupForm.classList.add('form--inactive');
    if (res.data.status === 'success') {
      showAlert('success', 'Sign up account successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
      window.setTimeout(() => {
        signupForm.classList.remove('form--inactive');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
