/* eslint-disable */
import { showAlert } from './alert';

export const deleteItem = async (type, id) => {
  try {
    const res = await axios.delete(`/api/v1/${type}/${id}`);

    if (res.data === '') {
      showAlert('success', `Delete ${type} successfully`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateItem = async (type, data, id) => {
  try {
    const res = await axios({
      method: 'PATCH',
      data,
      url: `/api/v1/${type}/${id}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Update ${type} successfully`);
      window.setTimeout(() => {
        location.assign(`/dashboard/${type}`);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const addItem = async (type, data) => {
  try {
    const res = await axios.post(`/api/v1/${type}`, data);

    if (res.data.status === 'success') {
      showAlert('success', `Add new ${type} successfully`);
      window.setTimeout(() => {
        location.assign(`/dashboard/${type}`);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
