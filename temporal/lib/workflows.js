'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.OneClickBuy = void 0
const workflow_1 = require('@temporalio/workflow')
const { purchase } = (0, workflow_1.proxyActivities)({
  startToCloseTimeout: '1 minute',
})
async function OneClickBuy(id) {
  const result = await purchase(id) // calling the activity
  await (0, workflow_1.sleep)('10 seconds') // demo use of timer
  console.log(`Activity ID: ${result} executed!`)
  return 'Done!'
}
exports.OneClickBuy = OneClickBuy
//# sourceMappingURL=workflows.js.map
