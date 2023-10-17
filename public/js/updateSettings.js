/* eslint-disable */

import { showAlert } from './alert';

export const updateUserData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/me',
      data: { name, email },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Update your data successfully');
      window.setTimeout(() => location.reload(true), 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
