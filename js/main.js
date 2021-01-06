document.addEventListener("DOMContentLoaded", function() {
  window.quiz = new Quiz();
  window.quiz.initQuiz('data/questions.json', 'question-content')
});
