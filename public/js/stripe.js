/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51GuA7YB18epm9fTXyuPOwk1KIWpp9f4H0zY5bJe0SEINe1JeglybwUGDcQcIYe3MFjglOzCwYaT3V1z40HtXH6EP005ri5gvvB'
);

export const bookTour = async tourId => {
  // tourId coming from the user interface
  try {
    // 1) Get checkout session from Endpoint/API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
