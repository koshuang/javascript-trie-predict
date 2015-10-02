/*jshint strict:true, undef:true, noarg:true, immed:true, trailing:true, expr:true, maxlen:120*/
/*global process: true, console:true, require:true, define:true*/

(function () {
  'use strict';

  // ---------- Dependencies ----------

  var fs = require('fs');
  var Predict = require('./src/predict');

  // ---------- Variables ----------

  var usage = 'Usage: node main.js [dictionary] [sequence]';
  var words = [];
  var sequence;

  // Some basic CLI parameter validation

  if (process.argv.length < 4) {
    console.log('Dictionary and number sequence required, ' + usage);
    return;
  }

  sequence = parseInt(process.argv[3], 10);

  if (typeof(sequence) !== 'number' || isNaN(sequence)) {
    console.log('Sequence must be a valid number sequence');
    return;
  }

  // ---------- Read dictionary file ----------

  // Read file from filesystem ("app" entry point)

  var time = new Date().getTime();
  console.log('Reading dictionary file...');

  fs.readFile(process.argv[2], function (error, data) {
    console.log('Done. [' + (new Date().getTime() - time).toString() + 'ms]');

    if (error) {
      console.log(error + '\n');
      console.log('Error reading dictionary file, ' + usage);
      return;
    }

    time = new Date().getTime();
    console.log('Parsing dictionary contents...');
    var predict = new Predict(data);
    console.log('Done. [' + (new Date().getTime() - time).toString() + 'ms]');

    time = new Date().getTime();
    console.log('Finding exact matches...');
    var exactWords = predict.findWords(sequence, predict.tree, true);
    console.log('Done. [' + (new Date().getTime() - time).toString() + 'ms]');

    if (process.argv[4] !== '--no-all-match') {
      time = new Date().getTime();
      console.log('Finding all matches...');
      words = predict.findWords(sequence, predict.tree);
      console.log('Done. [' + (new Date().getTime() - time).toString() + 'ms]');

      time = new Date().getTime();
      console.log('Sorting exact matches...');
      exactWords = predict.sortWords(exactWords);
      console.log('Done. [' + (new Date().getTime() - time).toString() + 'ms]');

      time = new Date().getTime();
      console.log('Sorting all matches...');
      words = predict.sortWords(words);
      console.log('Done. [' + (new Date().getTime() - time).toString() + 'ms]');
    }

    console.log('\n');

    if (exactWords.length > 0) {
      console.log('Exact matches');
      console.log('------------------------------');
      console.log(exactWords.toString());
    } else {
      console.log('*    No exact matches  :(    *\n');
      console.log('------------------------------\n');
    }

    if (process.argv[4] !== '--no-all-match') {
      if (words.length > 0) {
        console.log('All matches');
        console.log('------------------------------');
        console.log(words.toString());
      } else {
        console.log('*       No matches  :\'(      *\n');
        console.log('------------------------------\n');
      }
    }
  });

  // ---------- 'class'es ----------

  Array.prototype.toString = function () {
    var string = '';
    this.forEach(function (word) {
      string += word.toString() + '\n';
    });
    return string;
  };



}());
