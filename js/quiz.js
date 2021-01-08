class Quiz {
  LOCALSTORAGE_SAVE_KEY = 'quiz-progress';

  state = {
    seed: '',
    activeQuestion: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    shuffledQuestions: [],
  };
  questions;

  $questionContainer;

  constructor () {}

  async initQuiz (questionsAsset, questionContainerSelector) {
    // Load questions
    this.questions = await this.getQuestions(questionsAsset);
    console.log(this.questions, 'Questions loaded');

    this.$questionContainer = document.getElementsByClassName(questionContainerSelector)[0];

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

  renderNextQuestion () {
    const question = this.questions[this.state.shuffledQuestions[this.state.activeQuestion]];

    // Correct answer always lies at place 0
    const correctAnwser = question.answers[0];

    const answers = this._shuffleArray(question.answers);

    this.$questionContainer.innerHTML = `
            <header>
              <h1></h1>
              <p><b>${question.title}</b></p>
            </header>

            ${answers.map((answer, index) => {
              return `
              <p class="answer" data-valid="${answer === correctAnwser}">
                <b>${this._indexToLetter(index)})</b> ${answer}
              </p>`;
            }).join('')}

            <footer>
              <ul class="icons">
                <li>            
                    <button onclick="window.quiz.renderNextQuestion()" class="next-question-button" disabled="disabled">Järgmine küsimus</button>
                </li>
              </ul>
            </footer>
    `;

    // As we're not keeping the references to the DOM Elements
    // We don't have to worry about dangling event listeners as these will be removed by GC
    document.querySelectorAll('.answer').forEach($anwserElement => {
      $anwserElement.addEventListener('click', this.answerClickHandler.bind(this));
    })
  }

  answerClickHandler ($event) {
    const isCorrectAnwser = $event.target.dataset.valid;

    // Always add a special class to the answer user selected
    $event.target.classList.add('user-selected');

    // Increment active question
    this.state.activeQuestion++;

    // TODO: Check quiz over state

    // If the correct answer was given, just paint it green
    // Otherwise paint it red and give correct answer green tint
    if (isCorrectAnwser === "true") {
      $event.target.classList.add('correct');
    } else {
      document.querySelector('[data-valid="true"]').classList.add('correct');
      $event.target.classList.add('wrong');
    }

    document.querySelector('.next-question-button').disabled = false;

    this.saveProgress();
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

    // If state seed is not present, generate one now, this is just a random short seed
    if (!this.state.seed) {
      this.state.seed = +(Math.random() * 1000000).toFixed(0);
    }

    // Randomise question order
    // Create an array of question indexes
    const questionsIndexes = this.questions.map((q, index) => index);

    // Shuffle the array using seeded random, with the same seed and same number of questions, this will always
    // result in the same array
    this.state.shuffledQuestions = this._shuffleArray(questionsIndexes, this.state.seed);
  }

  clearProgress () {
    localStorage.removeItem(this.LOCALSTORAGE_SAVE_KEY);
    this.state = {
      activeQuestion: 0,
      answeredQuestions: [],
    }
  }

  _indexToLetter (index) {
    return 'abcdefghijklmnopqrstuvw'[index];
  }

  _shuffleArray (array, seed) {
    const seededRandom = new Math.seedrandom(seed);
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(seededRandom() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
