function Word(word, occurrences) {
  this.word = word;
  this.occurrences = occurrences;
}

Word.prototype.toString = function() {
  return this.word + ' (' + this.occurrences + ')';
};

module.exports = Word;
