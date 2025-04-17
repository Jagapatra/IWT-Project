// Questions data
const questionsData = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correct: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Harper Lee", "J.K. Rowling", "Mark Twain", "Jane Austen"],
    correct: 0,
  },
];

const examState = {
  answers: Array(questionsData.length).fill(null),
  timer: 300, // 5 minutes in seconds
};

// Render questions
function renderQuestions() {
  const questionsContainer = document.querySelector(".questions-container");
  questionsContainer.innerHTML = questionsData
    .map(
      (q, i) => `
      <div class="question" id="question-${i + 1}">
        <div class="question-header">${i + 1}. ${q.question}</div>
        <div class="options">
          ${q.options
            .map(
              (opt, idx) => `
            <label>
              <input type="radio" name="q${i}" value="${idx}">
              ${opt}
            </label>
          `
            )
            .join("")}
        </div>
      </div>
    `
    )
    .join("");
}

// Render navigation
function renderNavigation() {
  const navigator = document.querySelector(".question-navigator");
  navigator.innerHTML = questionsData
    .map(
      (_, i) => `
    <div class="question-number unanswered" data-question="${i + 1}">
      ${i + 1}
    </div>
  `
    )
    .join("");

  navigator.addEventListener("click", (e) => {
    if (e.target.classList.contains("question-number")) {
      const questionId = e.target.dataset.question;
      document.getElementById(`question-${questionId}`).scrollIntoView({
        behavior: "smooth",
      });
    }
  });
}

// Update navigation status
function updateQuestionStatus(questionIndex) {
  const navButton = document.querySelector(
    `.question-number[data-question="${questionIndex + 1}"]`
  );
  navButton.classList.remove("unanswered", "incorrect", "answered");
  navButton.classList.add("answered");
}

// Timer countdown
function startTimer() {
  const timerDisplay = document.querySelector(".timer");
  const interval = setInterval(() => {
    const minutes = Math.floor(examState.timer / 60);
    const seconds = examState.timer % 60;
    timerDisplay.textContent = `Time Left: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (examState.timer === 0) {
      clearInterval(interval);
      alert("Time's up! The exam will be submitted automatically.");
      submitExam();
    }
    examState.timer -= 1;
  }, 1000);
}

// Submit exam
function submitExam() {
  if (examState.answers.includes(null)) {
    alert("Please answer all questions before submitting.");
    return;
  }
  const score = examState.answers.reduce(
    (total, ans, i) => (ans === questionsData[i].correct ? total + 1 : total),
    0
  );
  const incorrectCount = examState.answers.filter(
    (ans, i) => ans !== null && ans !== questionsData[i].correct
  ).length;

  alert(
    `Exam submitted! 
Score: ${(score / questionsData.length) * 100}% 
Correct: ${score} 
Incorrect: ${incorrectCount}`
  );
  window.location.href="index.html";
}

// Setup listeners
function setupListeners() {
  document.querySelector(".questions-container").addEventListener("change", (e) => {
    const questionIndex = parseInt(e.target.name.replace("q", ""));
    examState.answers[questionIndex] = parseInt(e.target.value);
    updateQuestionStatus(questionIndex);
  });

  document.querySelector(".submit-btn").addEventListener("click", submitExam);
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();
  renderNavigation();
  setupListeners();
  startTimer();
});
