/* eslint-disable */
// * we need to config the alert because bt default from JS it look not good
const bodyEl = document.querySelector('body');
export const showAlert = (type, msg, time = 7) => {
  // * remove alert when we show other alert
  hideAlert();
  //type is success or error
  // * of course that we need to create and style classes for alert in CSS and also HTML after that we add it via JS code
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  bodyEl.insertAdjacentHTML('afterbegin', markup);
  // * remove alert in 3 seconds
  window.setTimeout(() => hideAlert(), time * 1000);
};

const hideAlert = () => {
  const alertEl = document.querySelector('.alert');
  // ? so why we need to check this?
  // * because if we use alertEl.remove() so in the case we have many alert classes element in our HTML alertEl.remove() alway remove the first alert element
  // ! and there fore we need to use this trick to remove exactly alert element we will remove
  // * How it work: 1 we will find alert parent element, 2 then remove alert from this parent element
  if (alertEl) alertEl.parentElement.removeChild(alertEl);
};
