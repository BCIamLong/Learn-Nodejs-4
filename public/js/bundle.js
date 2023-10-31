/* eslint-disable */ // * so in index.js file we will import all files from other file in this folder
// * and then when we build parcel it will take all code from all files into one
/* eslint-disable */ /* eslint-disable */ // * we need to config the alert because bt default from JS it look not good
const $fa3c8714c3f1b580$var$bodyEl = document.querySelector("body");
const $fa3c8714c3f1b580$export$de026b00723010c1 = (type, msg, time = 7)=>{
    // * remove alert when we show other alert
    $fa3c8714c3f1b580$var$hideAlert();
    //type is success or error
    // * of course that we need to create and style classes for alert in CSS and also HTML after that we add it via JS code
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    $fa3c8714c3f1b580$var$bodyEl.insertAdjacentHTML("afterbegin", markup);
    // * remove alert in 3 seconds
    window.setTimeout(()=>$fa3c8714c3f1b580$var$hideAlert(), time * 1000);
};
const $fa3c8714c3f1b580$var$hideAlert = ()=>{
    const alertEl = document.querySelector(".alert");
    // ? so why we need to check this?
    // * because if we use alertEl.remove() so in the case we have many alert classes element in our HTML alertEl.remove() alway remove the first alert element
    // ! and there fore we need to use this trick to remove exactly alert element we will remove
    // * How it work: 1 we will find alert parent element, 2 then remove alert from this parent element
    if (alertEl) alertEl.parentElement.removeChild(alertEl);
};


const $740edc1be548417a$var$loginForm = document.querySelector(".login-form .form");
const $740edc1be548417a$export$596d806903d1f59e = async (email, password)=>{
    // const url = 'http://127.0.0.1:3000/api/v1/users/login';
    // const data = {
    //   email,
    //   password,
    // };
    // * Use AJAX from Javascript support
    // const res = await fetch(url, {
    //   method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //   mode: 'cors', // no-cors, *cors, same-origin
    //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //   credentials: 'same-origin', // include, *same-origin, omit
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: JSON.stringify(data),
    // });
    // const check = await res.json();
    // console.log(check);
    // if (check.status === 'success') {
    //   alert('Login success');
    // } else {
    //   alert(check.message);
    // }
    // * but we can use the library about AJAX which is called axios
    // * a plug point for this axios that when the request AJAX is error it'll throw error for us and we can catch it to handle
    // ! we can also us try catch here but it's only work for modern browser and if we want it's work for many browser especially for old browser we can use then() catch()
    await axios({
        method: "POST",
        url: "/api/v1/users/login",
        data: {
            email: email,
            password: password
        }
    })// .then(res => res.json())
    .then((res)=>{
        $740edc1be548417a$var$loginForm.classList.add("form--inactive");
        // console.log(res);
        if (res.data.status === "success") {
            // alert('Login successfully');
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", "Login successfully");
            window.setTimeout(()=>{
                // window.location.href = '/';
                // * we can use 1 of two way to redirect to other page
                location.assign("/");
            }, 1000);
            window.setTimeout(()=>{
                $740edc1be548417a$var$loginForm.classList.remove("form--inactive");
            }, 3000);
        }
    }).catch((err)=>{
        // console.log(err.response.data);
        // alert(err.response.data.message);
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    });
};
const $740edc1be548417a$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await axios({
            method: "GET",
            url: "/api/v1/users/logout"
        });
        // console.log(res);
        // * we also need to reload page why? because we are codding  in front-end so we can't use render in here right, and reload page will send request with the empty the cookie to server and isLoginIn router will take it and not return user => in this time user is undefined and then the login in our pug file will check and display login and signup buttons
        if (res.data?.status === "success") {
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", "Logout successfully");
            window.setTimeout(()=>{
                // * we can use reload page here with: location.reload(true), set option true to also force reload server, if we don't have this it's only reload with the cache which it's storage in the first time run and of course the page will not change and so it's important to set option true here
                location.assign("/");
            }, 1000);
        }
    } catch (err) {
        // * usually we don't have error when we logout but to ensure like in the case we don't have the internet we also want to show nice notification for user
        // console.log(err);
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response?.data.message);
    }
};


/* eslint-disable */ 
const $8949a5cd0baaab58$var$signupForm = document.querySelector(".signup-form .form");
const $8949a5cd0baaab58$export$7200a869094fec36 = async (data)=>{
    try {
        $8949a5cd0baaab58$var$signupForm.classList.add("form--inactive");
        const res = await axios({
            method: "POST",
            url: "/api/v1/users/signup",
            data: data
        });
        if (res.data.status === "success") {
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", "Sign up account successfully");
            window.setTimeout(()=>{
                location.assign("/signup-verify");
            }, 1000);
            window.setTimeout(()=>{
                $8949a5cd0baaab58$var$signupForm.classList.remove("form--inactive");
            }, 3000);
        }
    } catch (err) {
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    }
};


/* eslint-disable */ // ! we need to turn off eslint here because it's setup for nodejs, so some variable in normal js in JS DOM like document not have in nodejs right so it'll catch err if we use eslint here
"use strict";
const $6954e231f70b5f48$export$4c5dd147b21b9176 = (locations)=>{
    // * so with map we don't use google map instead we use mapbox why because sometime the google map will require the credit to perform action so its not good for our because we only learn
    // * there for we will use mapbox: https://docs.maptiler.com
    // ! https://docs.maptiler.com/sdk-js/api/map/#map-options
    maptilersdk.config.apiKey = "Q7Vgp9F8J5vS7jWT7dCb";
    const map = new maptilersdk.Map({
        // * now we don't want center map, we want the map automatically find the tour location and display that place
        // * so we will put all locations points in map and the map will find and display the map fit with these points and display all of them
        container: "map",
        style: maptilersdk.MapStyle.STREETS,
        scrollZoom: false,
        // center: [-118, 34], // starting position [lng, lat]
        zoom: 1
    });
    // * so we will create part with tour locations by create bound, and then put it to map and display
    // !https://docs.maptiler.com/sdk-js/api/geography/#lnglatbounds
    const bounds = new maptilersdk.LngLatBounds();
    locations.forEach((loc)=>{
        // * we can use default marker from map library but usually it's not good choice why? because it might in the same with other website if they also use this marker, and by default it might not fit with our design
        // * therefore we need to custom this marker
        const markerEl = document.createElement("div");
        markerEl.className = "marker";
        //! https://docs.maptiler.com/sdk-js/api/markers/#marker#getelement
        // * add marker
        new maptilersdk.Marker({
            element: markerEl,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        // * add popup
        // !https://docs.maptiler.com/sdk-js/api/markers/#popup
        // * we can specify some options to config this popup it's on document
        new maptilersdk.Popup({
            offset: 30,
            closeOnClick: false,
            focusAfterOpen: false,
            closeButton: false
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
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
            right: 100
        }
    });
};


/* eslint-disable */ 
const $373a691a0b32f115$export$d88aa9b9d4bd90c2 = async (options)=>{
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
        const btn = document.querySelector(`.form-user-${options.type === "data" ? "data" : "settings"} .btn`);
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", `Update ${options.type.toUpperCase()} loading...`);
        btn.setAttribute("disabled", "");
        btn.innerHTML = "Updating";
        const url = options.type === "data" ? "/api/v1/users/me" : "/api/v1/users/update-current-password";
        const res = await axios({
            method: "PATCH",
            url: url,
            data: options.data
        });
        if (res.data.status === "success") {
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", `Update your ${options.type.toUpperCase()} successfully`);
            // window.setTimeout(() => location.reload(true), 1000);
            if (options.type === "data") return window.setTimeout(()=>location.reload(true), 1000);
            // * in this case when we update password we don't have anything to show user after we update password therefore we don't need to reload page to get data
            // * and we only clear inputs that's it
            // * but in real world we see that when we update anything it's not reload page because when we use AJAX or use React, Vue it's always have data send back and we only take this data and display not to need go to server side to get data
            btn.innerHTML = `Save ${options.type === "data" ? "settings" : "password"}`;
            btn.removeAttribute("disabled");
            document.querySelector("#password-current").value = "";
            document.querySelector("#password").value = "";
            document.querySelector("#password-confirm").value = "";
        }
    } catch (err) {
        const btn = document.querySelector(`.form-user-${options.type === "data" ? "data" : "settings"} .btn`);
        btn.innerHTML = `Save ${options.type === "data" ? "settings" : "password"}`;
        btn.removeAttribute("disabled");
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    }
}; // export const updateUserData = async (name, email) => {
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


/* eslint-disable */ 
// ! now we will use public key because we're manipulating with front-end
const $2114f23f0d97310e$var$stripe = Stripe("pk_test_51O4mlfGiKCgw0SOr7qySjg73FIYgBmlM1hnRtxFMxFsvB60iYll2s6Vv5rCgkgZdHZBPZmRWV1NEzAuO0I1nYiF500mJJ6ZMHW");
const $2114f23f0d97310e$export$8d5bdbf26681c0c2 = async (tourId)=>{
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
        if (res.data.status === "success") await $2114f23f0d97310e$var$stripe.redirectToCheckout({
            sessionId: res.data.session.id
        });
    } catch (err) {
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    }
};



/* eslint-disable */ 
const $075ff7d20839cbac$export$8cb1f130522c94b9 = async (type, data)=>{
    try {
        const { tourId: tourId } = document.querySelector(".section-reviews").dataset;
        const res = await axios({
            method: "POST",
            url: `/api/v1/tours/${tourId}/${type}`,
            data: data
        });
        if (res.data.status === "success") {
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", `Your ${type} added`);
            window.setTimeout(()=>{
                location.reload(true);
            }, 1000);
        }
    } catch (err) {
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    }
};
const $075ff7d20839cbac$export$7c4e5c524f1ce05e = async (type, id)=>{
    try {
        const res = await axios.delete(`/api/v1/${type}/${id}`);
        if (res.data === "") {
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", `Delete ${type} successfully`);
            window.setTimeout(()=>{
                location.reload(true);
            }, 1000);
        }
    } catch (err) {
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    }
};
const $075ff7d20839cbac$export$ac459dbf0b216ae9 = async (type, id, data)=>{
    try {
        const res = await axios({
            method: "PATCH",
            url: `/api/v1/${type}/${id}`,
            data: data
        });
        if (res.data.status === "success") {
            (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", `Your ${type} updated`);
            window.setTimeout(()=>{
                location.reload(true);
            }, 1000);
        }
    } catch (err) {
        (0, $fa3c8714c3f1b580$export$de026b00723010c1)("error", err.response.data.message);
    }
};


// import { showAlert } from './alert';
const $4c50ebc26330ccb1$var$loginForm = document.querySelector(".login-form .form");
const $4c50ebc26330ccb1$var$signupForm = document.querySelector(".signup-form .form");
const $4c50ebc26330ccb1$var$mapEl = document.querySelector("#map");
const $4c50ebc26330ccb1$var$bodyEl = document.querySelector("body");
const $4c50ebc26330ccb1$var$bookmarkBtn = document.querySelector(".btn--bookmark");
const $4c50ebc26330ccb1$var$bookTourBtn = document.querySelector("#book-tour");
const $4c50ebc26330ccb1$var$navLogoutBtn = document.querySelector(".nav__el--logout");
const $4c50ebc26330ccb1$var$userDataForm = document.querySelector(".form-user-data");
const $4c50ebc26330ccb1$var$userPwdForm = document.querySelector(".form-user-settings");
const $4c50ebc26330ccb1$var$reviewForm = document.querySelector(".form-new-review");
const $4c50ebc26330ccb1$var$myReviewsForms = document.querySelectorAll(".form-my-review");
if ($4c50ebc26330ccb1$var$bodyEl?.dataset.alert !== "") (0, $fa3c8714c3f1b580$export$de026b00723010c1)("success", $4c50ebc26330ccb1$var$bodyEl?.dataset.alert, 9);
$4c50ebc26330ccb1$var$myReviewsForms?.forEach((form)=>{
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const children = e.target.childNodes;
        const review = children[3].value;
        const rating = children[5].value;
        (0, $075ff7d20839cbac$export$ac459dbf0b216ae9)("reviews", e.target.dataset.review, {
            review: review,
            rating: rating
        });
    });
});
$4c50ebc26330ccb1$var$reviewForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    const review = document.querySelector("#review").value;
    const rating = document.querySelector("#rating").value;
    console.log(review, rating);
    (0, $075ff7d20839cbac$export$8cb1f130522c94b9)("reviews", {
        review: review,
        rating: rating
    });
});
$4c50ebc26330ccb1$var$userDataForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    // * because we don't use form event to pass data so we need to create form data with my own
    // * with form event form data will automatically create by encrypt="multipart/form-data" right but now we use API and not form event
    const form = new FormData();
    form.append("name", document.querySelector("#name").value);
    form.append("email", document.querySelector("#email").value);
    // const email = document.querySelector('#email').value;
    // const name = document.querySelector('#name').value;
    // * the axios library will got this form data and send as normal way we did before
    // * we will add new value that's photo and with file we use files to get value of file in this case it's array so we need use [0] ok
    form.append("photo", document.querySelector("#photo").files[0]);
    // console.log(form);
    (0, $373a691a0b32f115$export$d88aa9b9d4bd90c2)({
        type: "data",
        data: form
    });
});
$4c50ebc26330ccb1$var$userPwdForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    const currentPassword = document.querySelector("#password-current").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#password-confirm").value;
    // * because update lost some time so we can show some notify meaningful in this case like loading icon, loading message....
    // showAlert('success', `Update your PASSWORD loading...`);
    // document.querySelector('.btn').setAttribute('disable');
    (0, $373a691a0b32f115$export$d88aa9b9d4bd90c2)({
        type: "password",
        data: {
            currentPassword: currentPassword,
            password: password,
            passwordConfirm: passwordConfirm
        }
    });
// document.querySelector('.btn').removeAttribute('disable');
});
$4c50ebc26330ccb1$var$signupForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#passwordConfirm").value;
    // console.log(email, password);
    (0, $8949a5cd0baaab58$export$7200a869094fec36)({
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm
    });
});
$4c50ebc26330ccb1$var$loginForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    // * with input element we can use .value to get value we enter in inputs
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    // console.log(email, password);
    (0, $740edc1be548417a$export$596d806903d1f59e)(email, password);
});
$4c50ebc26330ccb1$var$bookmarkBtn?.addEventListener("click", function(e) {
    e.preventDefault();
    if (!$4c50ebc26330ccb1$var$bookmarkBtn?.classList.contains("btn--green")) {
        $4c50ebc26330ccb1$var$bookmarkBtn.classList.add("btn--green");
        return (0, $075ff7d20839cbac$export$8cb1f130522c94b9)("bookmarks", {});
    }
    $4c50ebc26330ccb1$var$bookmarkBtn.classList.remove("btn--green");
    (0, $075ff7d20839cbac$export$7c4e5c524f1ce05e)("bookmarks", $4c50ebc26330ccb1$var$bookmarkBtn.dataset.bookmark);
});
$4c50ebc26330ccb1$var$bookTourBtn?.addEventListener("click", function(e) {
    e.preventDefault();
    // * data-tour-id in JS we get it with dataset.tourId okay it auto convert tour-id like this format to camel case
    e.target.innerHTML = "Processing...";
    (0, $2114f23f0d97310e$export$8d5bdbf26681c0c2)(e.target.dataset.tourId);
});
$4c50ebc26330ccb1$var$navLogoutBtn?.addEventListener("click", function(e) {
    e.preventDefault();
    (0, $740edc1be548417a$export$a0973bcfe11b05c9)();
});
// const locationsData = JSON.parse(mapEl.getAttribute('data-locations'));
// * we have other way better to get data from data-locations attribute, that's technique use dataset
// * data-locations => dataset.locations(set is represent for dash -)
if ($4c50ebc26330ccb1$var$mapEl) {
    const locationsData = JSON.parse($4c50ebc26330ccb1$var$mapEl.dataset?.locations);
    (0, $6954e231f70b5f48$export$4c5dd147b21b9176)(locationsData);
} // console.log(locationsData);


//# sourceMappingURL=bundle.js.map
