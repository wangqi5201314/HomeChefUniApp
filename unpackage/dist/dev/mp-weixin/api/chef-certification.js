"use strict";
const api_request = require("./request.js");
function getChefCertification() {
  return api_request.request.get("/api/chef/certification/me");
}
function submitChefCertification(data) {
  return api_request.request.post("/api/chef/certification/submit", data);
}
exports.getChefCertification = getChefCertification;
exports.submitChefCertification = submitChefCertification;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef-certification.js.map
