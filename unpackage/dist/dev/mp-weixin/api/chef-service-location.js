"use strict";
const api_request = require("./request.js");
function normalizeServiceLocationPayload(data = {}) {
  return {
    locationName: data.locationName ? String(data.locationName).trim() : "",
    province: data.province ? String(data.province).trim() : "",
    city: data.city ? String(data.city).trim() : "",
    district: data.district ? String(data.district).trim() : "",
    town: data.town ? String(data.town).trim() : "",
    detailAddress: data.detailAddress ? String(data.detailAddress).trim() : "",
    longitude: data.longitude === "" || data.longitude === void 0 || data.longitude === null ? 0 : Number(data.longitude),
    latitude: data.latitude === "" || data.latitude === void 0 || data.latitude === null ? 0 : Number(data.latitude)
  };
}
function getChefServiceLocationList() {
  return api_request.request.get("/api/chef/service-location/list");
}
function getChefServiceLocationDetail(id) {
  return api_request.request.get(`/api/chef/service-location/${id}`);
}
function createChefServiceLocation(data) {
  return api_request.request.post("/api/chef/service-location", normalizeServiceLocationPayload(data));
}
function updateChefServiceLocation(id, data) {
  return api_request.request.put(`/api/chef/service-location/${id}`, normalizeServiceLocationPayload(data));
}
function deleteChefServiceLocation(id) {
  return api_request.request.del(`/api/chef/service-location/${id}`);
}
function activateChefServiceLocation(id) {
  return api_request.request.post(`/api/chef/service-location/${id}/activate`);
}
exports.activateChefServiceLocation = activateChefServiceLocation;
exports.createChefServiceLocation = createChefServiceLocation;
exports.deleteChefServiceLocation = deleteChefServiceLocation;
exports.getChefServiceLocationDetail = getChefServiceLocationDetail;
exports.getChefServiceLocationList = getChefServiceLocationList;
exports.updateChefServiceLocation = updateChefServiceLocation;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-service-location.js.map
