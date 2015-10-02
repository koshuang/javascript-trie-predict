'use strict';

var fs = require('fs');
var Predict = require('../src/predict');
var predict;

describe('Predict', function() {
  beforeEach(function(done) {

    fs.readFile('./string.txt', function (error, data) {
      predict = new Predict(data);

      done();
    });
  });

  it('should work', function() {
    var sequence = '27';

    var exactWords = predict.findWords(sequence, predict.tree, true);

    expect(exactWords.length).toBe(3);
    expect(exactWords[0].word).toBe('ar');
    expect(exactWords[1].word).toBe('arx');
    expect(exactWords[2].word).toBe('ars');
  });
});
