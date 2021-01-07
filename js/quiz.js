class Quiz {
  LOCALSTORAGE_SAVE_KEY = 'quiz-progress';

  state = {
    activeQuestion: 0,
    answeredQuestions: [],
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

  renderQuestion () {
    const question = this.questions[this.state.activeQuestion];
    console.log('Rendering question', question.answers);

    this.$questionContainer.innerHTML = `
            <header>
              <h1></h1>
              <p><b>${question.title}</b></p>
            </header>

            ${question.answers.map((answer, index) => {
              return `
              <p class="answer" data-index="${index}">
                <b>${this._indexToLetter(index)})</b> ${answer}
              </p>`;
            }).join('')}

            <footer>
              <ul class="icons">
                <li>            
                    <button onclick="window.quiz.renderQuestion()" class="next-question-button" disabled="disabled">Järgmine küsimus</button>
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
    const questionIndex = $event.target.dataset.index;

    // Always add a special class to the answer user selected
    $event.target.classList.add('user-selected');

    // Increment active question
    this.state.activeQuestion++;

    // TODO: Check quiz over state

    // If the correct answer was given, just paint it green
    // Otherwise paint it red and give correct answer green tint
    if (+questionIndex === 0) {
      $event.target.classList.add('correct');
    } else {
      document.querySelector('[data-index="0"]').classList.add('correct');
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
  }

  clearProgress () {
    localStorage.setItem(this.LOCALSTORAGE_SAVE_KEY, undefined);
    this.state = {
      activeQuestion: 0,
      answeredQuestions: [],
    }
  }

  _indexToLetter (index) {
    return 'abcdefghijklmnopqrstuvw'[index];
  }

}
