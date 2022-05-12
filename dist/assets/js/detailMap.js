mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 15, // starting zoom
});
const marker = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${campground.title}</h3>`)
  )
  .addTo(map);

map.addControl(new mapboxgl.NavigationControl());
// console.log(campground);
// const test = {
//   1: 2,
//   2: "WebGLTransformFeedback",
//   3: "SAJLK",
// };
// // console.log(JSON.parse(`${test}`));
// console.log(JSON.stringify(test));
