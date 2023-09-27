var Common = require('../../lib/Common');
var should = require('should');

process.chdir(__dirname);

describe('Common utilities', function () {
  describe('Config file detection', function () {
    var tests = [
      { arg: "ecosystem.json", expected: "json" },
      { arg: "ecosystem.yml", expected: "yaml" },
      { arg: "ecosystem.yaml", expected: "yaml" },
      { arg: "ecosystem.config.js", expected: "js" },
      { arg: "ecosystem.config.cjs", expected: "js" },
      { arg: "ecosystem.config.mjs", expected: "mjs" },
    ]

    tests.forEach(function (test) {
      it('should accept configuration file ' + test.arg , function () {
        var result = Common.isConfigFile(test.arg);
        should(result).eql(test.expected);
      })
    });

    it('should not accept unknown filename', function () {
      should(Common.isConfigFile('lorem-ipsum.js')).be.null();
    })
  })
})
