"use strict";
const api_request = require("./request.js");
function getChefList(params) {
  return api_request.request.get("/api/chef/list", params);
}
exports.getChefList = getChefList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chef.js.map
