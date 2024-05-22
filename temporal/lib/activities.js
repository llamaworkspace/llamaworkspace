'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.purchase = void 0
const activity_1 = require('@temporalio/activity')
async function purchase(id) {
  console.log(`Purchased ${id}!`)
  await Promise.resolve()
  return activity_1.Context.current().info.activityId
}
exports.purchase = purchase
//# sourceMappingURL=activities.js.map
