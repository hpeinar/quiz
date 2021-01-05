class Quiz {
  LOCALSTORAGE_SAVE_KEY = 'quiz-progress';

  state = {
    activeQuestion: 0,
    answeredQuestions: [],
  };
  questions;

  constructor () {}

  async initQuiz (questionsAsset) {
    // Load questions
    this.questions = await this.getQuestions(questionsAsset);
    console.log(this.questions, 'Questions loaded');

    // Load user progress
    this.loadProgress();
  }

  getQuestions (assetPath) {
    return fetch(assetPath)
      .then(response => response.json())
      .catch((err) => {
        console.error(err, `Failed to load Questions, invalid path provided? assetPath: ${assetPath}`);
      });
  }

  renderQuestion () {

  }

  // Saves user progress to device using localStorage
  // Progress is automatically saved on every question answer
  saveProgress () {
    localStorage.setItem(this.LOCALSTORAGE_SAVE_KEY, JSON.stringify(this.state));
  }

  // Loads the progress from localStorage
  // TODO: Invalidate progress if questions have changed?
  loadProgress () {
    const savedState = localStorage.getItem(this.LOCALSTORAGE_SAVE_KEY);
    if (savedState) {
      try {
        this.state = JSON.parse(savedState);
        console.log(this.state, 'State restored from localStorage');
      } catch (e) {
        console.error(e, 'Failed to parse saved progress');
      }
    }
  }

  clearProgress () {
    localStorage.setItem(this.LOCALSTORAGE_SAVE_KEY, undefined);
    this.state = {
      activeQuestion: 0,
      answeredQuestions: [],
    }
  }


}
