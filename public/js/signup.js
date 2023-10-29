/* eslint-disable */
import { showAlert } from './alert';
const signupForm = document.querySelector('.signup-form .form');
export const signup = async data => {
  try {
    signupForm.classList.add('form--inactive');
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Sign up account successfully');
      window.setTimeout(() => {
        location.assign('/signup-verify');
      }, 1000);
      window.setTimeout(() => {
        signupForm.classList.remove('form--inactive');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
