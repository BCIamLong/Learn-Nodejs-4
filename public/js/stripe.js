/* eslint-disable */

import { showAlert } from './alert';

// ! now we will use public key because we're manipulating with front-end
const stripe = Stripe(
  'pk_test_51O4mlfGiKCgw0SOr7qySjg73FIYgBmlM1hnRtxFMxFsvB60iYll2s6Vv5rCgkgZdHZBPZmRWV1NEzAuO0I1nYiF500mJJ6ZMHW',
);

export const bookTour = async tourId => {
  try {
    // const url = `${window.location.protocol}://${window.location.host}/api/v1/tours/${tourId}`;
    // ! 1 Get checkout session from API
    const url = `${window.location.protocol}://${window.location.host}/api/v1/bookings/checkout-session/${tourId}`;
    // const res = await axios({
    //   method: 'GET',
    //   url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    // });
    // * we can use axios simple if we use with get method only with url
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // ! 2 create checkout form and use stripe to charge the credit card

    // if (res.data.status === 'success') location.assign(`${res.data.session.url}`);
    if (res.data.status === 'success')
      await stripe.redirectToCheckout({
        sessionId: res.data.session.id,
      });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
