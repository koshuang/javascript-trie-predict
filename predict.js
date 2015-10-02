/*jshint strict:true, undef:true, noarg:true, immed:true, trailing:true, expr:true, maxlen:120*/
/*global process: true, console:true, require:true, define:true*/

(function () {
  'use strict';

  // ---------- Dependencies ----------

  var fs = require('fs');


  // ---------- Variables ----------

  var usage = 'Usage: node predict.js [dictionary] [sequence]';
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

    console.log('\n');

    if (exactWords.length > 0) {
      console.log('Exact matches');
      console.log('------------------------------');
      console.log(exactWords.toString());
    } else {
      console.log('*    No exact matches  :(    *\n');
      console.log('------------------------------\n');
    }

    if (words.length > 0) {
      console.log('All matches');
      console.log('------------------------------');
      console.log(words.toString());
    } else {
      console.log('*       No matches  :\'(      *\n');
      console.log('------------------------------\n');
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

  function Word(word, occurrences) {
    this.word = word;
    this.occurrences = occurrences;
  }

  Word.prototype.toString = function () {
    return this.word + ' (' + this.occurrences + ')';
  };

  function Predict(words) {
    this.keyMap = {
      2: 'abc',
      3: 'def',
      4: 'ghi',
      5: 'jkl',
      6: 'mno',
      7: 'pqrs',
      8: 'tuv',
      9: 'wxyz'
    };

    this.words = words.toString()
    .replace(/[:;!?",'\.\*\[\]\d\$]/g, '')
    .replace(/\-\-/g, ' ')
    .split(/\s+/g);


    this.tree = this.buildTree();
  }

  Predict.prototype.buildTree = function buildTree() {
    var tree = {};

    this.words.forEach(function (word) {
      var letters = word.split('');
      var leaf = tree;

      for (var i = 0; i < letters.length; i++) {
        var letter = letters[i].toLowerCase();
        var existing = leaf[letter];
        var last = (i === letters.length - 1);

        // If child leaf doesn't exist, create it
        if (typeof(existing) === 'undefined') {
          // If we're at the end of the word, mark with number,
          // don't create a leaf
          leaf = leaf[letter] = last ? 1 : {};

          // If final leaf exists already
        } else if (typeof(existing) === 'number') {
          // Increment end mark number, to account for duplicates
          if (last) {
            leaf[letter]++;

            // Otherwise, if we need to continue,
            // create leaf object with '$' marker
          } else {
            leaf = leaf[letter] = { $: existing };
          }

          // If we're at the end of the word and at a leaf object with an
          // end '$' marker, increment the marker to account for duplicates
        } else if (typeof(existing) === 'object' && last) {
          if (existing.hasOwnProperty('$')) {
            leaf[letter].$++;
          } else {
            leaf[letter] = existing;
            leaf[letter].$ = 1;
          }

          // Just keep going
        } else {
          leaf = leaf[letter];
        }
      }
    });

    return tree;
  };


  // ---------- Traverse tree with sequence ----------
  Predict.prototype.findWords =
    function findWords(sequence, tree, exact, words, currentWord, depth) {

      var current = tree;

      sequence = sequence.toString();
      words = words || [];
      currentWord = currentWord || '';
      depth = depth || 0;

      // Check each leaf on this level
      for (var leaf in current) {
        var word = currentWord;
        var value = current[leaf];
        var key;

        // If the leaf key is '$' handle things one level off since we
        // ignore the '$' marker when digging into the tree
        if (leaf === '$') {
          key = sequence.charAt(depth - 1);
          if (depth >= sequence.length) {
            words.push(new Word(word, value));
          }
        } else {
          key = sequence.charAt(depth);
          word += leaf;
          if (typeof(value) === 'number') {
            if (!exact) {
              words.push(new Word(word, value));
            } else if (exact && depth + 1 == sequence.length) {
              words.push(new Word(word, value));
            }
          }
        }

        // If the leaf's value maps to our key or we're still tracing
        // the prefix to the end of the tree (`exact` is falsy), then
        // "we must go deeper"...
        if ((key && this.keyMap.hasOwnProperty(key) &&
             this.keyMap[key].indexOf(leaf) > -1) || (!key && !exact)) {
               this.findWords(sequence, value, exact, words, word, depth + 1);
             }
      }

      // Yeah, not as cool when not returning the recursive function call
      // returns, but we gotta just rely on JS references since we may be
      // going more than one way down the tree and we don't want to be
      // breaking the leaf loop
      return words;
    };


    // ---------- Sort matches by occurrences ----------
    Predict.prototype.sortWords = function sortWords(words) {
      return words.sort(function (first, second) {
        return second.occurrences - first.occurrences;
      });
    };

}());
