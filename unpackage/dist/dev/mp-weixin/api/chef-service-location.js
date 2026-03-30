"use strict";
const api_request = require("./request.js");
function normalizeServiceLocationPayload(data = {}) {
  return {
    province: data.province ? String(data.province).trim() : "",
    city: data.city ? String(data.city).trim() : "",
    district: data.district ? String(data.district).trim() : "",
    town: data.town ? String(data.town).trim() : "",
    detailAddress: data.detailAddress ? String(data.detailAddress).trim() : "",
    longitude: data.longitude === "" || data.longitude === void 0 || data.longitude === null ? 0 : Number(data.longitude),
    latitude: data.latitude === "" || data.latitude === void 0 || data.latitude === null ? 0 : Number(data.latitude)
  };
}
function getChefServiceLocation() {
  return api_request.request.get("/api/chef/service-location/me");
}
function saveChefServiceLocation(data) {
  return api_request.request.post("/api/chef/service-location/me", normalizeServiceLocationPayload(data));
}
exports.getChefServiceLocation = getChefServiceLocation;
exports.saveChefServiceLocation = saveChefServiceLocation;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-service-location.js.map
