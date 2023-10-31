/* eslint-disable */

import { showAlert } from './alert';

export const newResources = async (type, data) => {
  try {
    const { tourId } = document.querySelector('.section-reviews').dataset;
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourId}/${type}`,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `Your ${type} added`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const removeResources = async (type, id) => {
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

export const updateResources = async (type, id, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/${type}/${id}`,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `Your ${type} updated`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
