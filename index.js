const path = require('path')
const { writeJson } = require('fs-extra')
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })


function script() {
  return _.mapValues(application.tablesById, table =>
    _.set(_.omit(table, ['sampleRows']), 'columns', _.map(table.columns, item =>
      _.set(item, 'foreignTable', _.get(item, 'foreignTable.id')))))
}

function getUrl(baseId) {
  return `https://airtable.com/login?continue=/${baseId}/api/docs`
}

exports.default = function ({ baseId, email, password }) {
  nightmare
    .goto(getUrl(baseId))
    .wait(1000)
    .wait('#sign-in-form-fields-root > div > label > div')
    .type('#sign-in-form-fields-root > div > label > input[name="email"]', email)
    .type('#sign-in-form-fields-root > div > label > input[name="password"]', password)
    .click('#sign-in-form-fields-root > div > label > input[type="submit"]')
    .wait(1000)
    .wait('.docs > .languageTabs > .tab')
    .evaluate(script)
    .end()
    .then(function (result) {
      return writeJson(path.resolve(__dirname, 'downloads', `${BASE}.json`), result)
    })
    .catch(function (error) {
      console.error('Error:', error);
    })
}
