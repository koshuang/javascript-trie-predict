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

  describe('find exact', function() {
    it('should work for 27', function() {
      var sequence = '27';

      var exactWords = predict.findWords(sequence, predict.tree, true);

      expect(exactWords.length).toBe(2);
      expect(exactWords[0].word).toBe('ar');
      expect(exactWords[1].word).toBe('as');
    });

    it('should work for 43556', function() {
      var sequence = '43556';

      var matchedWords = predict.findWords(sequence, predict.tree, false);
      var exactWords = predict.findWords(sequence, predict.tree, true);

      expect(exactWords.length).toBe(4);
      expect(exactWords[0].word).toBe('gekko');
      expect(exactWords[1].word).toBe('gelly');
      expect(exactWords[2].word).toBe('hello');
      expect(exactWords[3].word).toBe('helly');


      expect(matchedWords.length).toBe(7);
      expect(matchedWords[0].word).toBe('gekko');
      expect(matchedWords[1].word).toBe('gekkones');
      expect(matchedWords[2].word).toBe('gekkonid');
      expect(matchedWords[3].word).toBe('gekkonidae');
      expect(matchedWords[4].word).toBe('gekkonoid');
      expect(matchedWords[5].word).toBe('gekkota');
      expect(matchedWords[6].word).toBe('hellness');
    });
  });
});
