document.addEventListener("DOMContentLoaded", function() {
  window.quiz = new Quiz();
  window.quiz.initQuiz('data/questions.tsv', 'question-content')
});
