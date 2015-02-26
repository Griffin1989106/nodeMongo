
var should        = require('should');

var Configuration = require('../../lib/Configuration.js');

describe('Configuration via SET / GET tests', function() {
  it('should set a value', function(done) {
    Configuration.set('key1', 'val1', function(err, data) {
      should(err).not.exists;
      done();
    });
  });

  it('should get all values', function(done) {
    Configuration.getAll(function(err, data) {
      should(err).not.exists;
      data.key1.should.eql('val1');
      done();
    });
  });

  it('should set another value', function(done) {
    Configuration.set('key2', 'val2', function(err, data) {
      should(err).not.exists;
      done();
    });
  });

  it('should get all values', function(done) {
    Configuration.getAll(function(err, data) {
      should(err).not.exists;
      data.key1.should.eql('val1');
      data.key2.should.eql('val2');
      done();
    });
  });

  it('should unset first value', function(done) {
    Configuration.unset('key1', function(err, data) {
      should(err).not.exists;
      done();
    });
  });

  it('should get all values', function(done) {
    Configuration.getAll(function(err, data) {
      should(err).not.exists;
      should(data.key1).not.exists;
      data.key2.should.eql('val2');
      done();
    });
  });

  it('should get all values SYNCHRONOUSLY', function() {
    var data = Configuration.getAllSync();

    should(data.key1).not.exists;
    data.key2.should.eql('val2');
  });
});
