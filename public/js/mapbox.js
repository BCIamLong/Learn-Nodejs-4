/* eslint-disable */
// ! we need to turn off eslint here because it's setup for nodejs, so some variable in normal js in JS DOM like document not have in nodejs right so it'll catch err if we use eslint here
'use strict';

// const tourName = document.querySelector('.heading-primary span');
// console.log(tourName.innerHTML);

// // * to retrieve our data from tour we can use ajax request basically to call our API and get the tour data
// const getTour = async () => {
//   // * AJAX
//   const res = await fetch('/api/v1/tours');
//   const toursData = await res.json();
//   return toursData;
// };

// (async () => {
//   const tours = await getTour();
//   console.log(tours);
// })();
// ! but in this case use AJAX is not necessary we have other way which is handy more
// * that we will put the locations of tour data in HTML attribute which is called data-name_data= value
// * this is nice trick when we want put the necessary data into element
// * in this case we can use  data-locations= value
export const displayMap = locations => {
  // * so with map we don't use google map instead we use mapbox why because sometime the google map will require the credit to perform action so its not good for our because we only learn

  // * there for we will use mapbox: https://docs.maptiler.com
  // ! https://docs.maptiler.com/sdk-js/api/map/#map-options
  maptilersdk.config.apiKey = 'Q7Vgp9F8J5vS7jWT7dCb';
  const map = new maptilersdk.Map({
    // * now we don't want center map, we want the map automatically find the tour location and display that place
    // * so we will put all locations points in map and the map will find and display the map fit with these points and display all of them
    container: 'map', // container's id or the HTML element to render the map
    style: maptilersdk.MapStyle.STREETS,
    scrollZoom: false, // * we don't want when we scroll thought this map and zoom the map right we only scroll in website so we need to disable this option
    // center: [-118, 34], // starting position [lng, lat]
    zoom: 1, // starting zoom
    // * so with interactive false we don't scroll mouse on map, so we do not anything with map and only watch
    // interactive: false,
  });

  // * so we will create part with tour locations by create bound, and then put it to map and display
  // !https://docs.maptiler.com/sdk-js/api/geography/#lnglatbounds
  const bounds = new maptilersdk.LngLatBounds();

  locations.forEach(loc => {
    // * we can use default marker from map library but usually it's not good choice why? because it might in the same with other website if they also use this marker, and by default it might not fit with our design
    // * therefore we need to custom this marker
    const markerEl = document.createElement('div');
    markerEl.className = 'marker';

    //! https://docs.maptiler.com/sdk-js/api/markers/#marker#getelement
    // * add marker
    new maptilersdk.Marker({
      element: markerEl,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // * add popup
    // !https://docs.maptiler.com/sdk-js/api/markers/#popup
    // * we can specify some options to config this popup it's on document
    new maptilersdk.Popup({
      offset: 30,
      closeOnClick: false,
      focusAfterOpen: false,
      closeButton: false,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // * Extend map bounds to include the current locations
    bounds.extend(new maptilersdk.LngLat(...loc.coordinates));
  });

  // !https://docs.maptiler.com/sdk-js/api/map/#map#fitbounds
  // ! note that we need to give zoom a value like default value it might 1,2,3... any number we want then the map will replace it
  map.fitBounds(bounds, {
    // !https://docs.maptiler.com/sdk-js/api/properties/#paddingoptions
    // * we can custom the padding of display map in some reason, in this case that's because our design
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100,
    },
  });
};
