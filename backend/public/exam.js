// Exam configuration
const examConfig = {
    duration: 600, // 10 minutes in seconds
    totalQuestions: 3,
    passingScore: 70,
    redirectDelay: 3000 // 3 seconds delay before redirect
};

// Exam state
let examState = {
    timeRemaining: examConfig.duration,
    answers: new Array(examConfig.totalQuestions).fill(null),
    isExamSubmitted: false,
    timer: null,
    score: 0
};

// Correct answers (in reality, these would come from a server)
const correctAnswers = {
    q1: 1, // "Hyper Text Markup Language"
    q2: 0, // "<a>"
    q3: 1  // "<p>"
};

// Initialize exam when document loads
document.addEventListener('DOMContentLoaded', () => {
    initializeExam();
    initializeQuestionNavigation();
    setupEventListeners();
});

function initializeExam() {
    updateTimer();
    startTimer();
    updateProgressBar();
}

function startTimer() {
    if (examState.timer) {
        clearInterval(examState.timer); // Clear any existing timer
    }
    
    examState.timer = setInterval(() => {
        if (examState.isExamSubmitted) {
            clearInterval(examState.timer);
            return;
        }
        
        examState.timeRemaining--;
        updateTimer();
        
        if (examState.timeRemaining <= 0) {
            submitExam(true); // Auto-submit when time runs out
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(examState.timeRemaining / 60);
    const seconds = examState.timeRemaining % 60;
    const timerDisplay = document.querySelector('.timer');
    timerDisplay.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </svg>
        Time Remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
    `;

    // Add warning class when time is running low (less than 1 minute)
    if (examState.timeRemaining < 60) {
        timerDisplay.style.color = '#ef4444';
        timerDisplay.style.animation = 'pulse 1s infinite';
    }
}

function initializeQuestionNavigation() {
    const navigator = document.querySelector('.question-navigator');
    const questions = document.querySelectorAll('.question');

    questions.forEach((question, index) => {
        const number = index + 1;
        const navButton = document.querySelector(`.question-number:nth-child(${number})`);
        
        if (navButton) {
            navButton.addEventListener('click', () => {
                questions[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    });
}

function setupEventListeners() {
    // Add change listeners to all radio buttons
    document.querySelectorAll('.option input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const questionNumber = parseInt(e.target.name.replace('q', '')) - 1;
            const selectedOption = Array.from(document.querySelectorAll(`input[name="${e.target.name}"]`))
                                      .indexOf(e.target);
            
            examState.answers[questionNumber] = selectedOption;
            updateQuestionStatus(questionNumber);
            updateProgressBar();
        });
    });

    // Add submit button listener
    document.querySelector('.submit-btn').addEventListener('click', () => {
        const unansweredQuestions = examState.answers.filter(answer => answer === null).length;
        
        if (unansweredQuestions > 0) {
            showAlert(`Please answer all questions before submitting. You have ${unansweredQuestions} unanswered question(s).`);
            highlightUnansweredQuestions();
            return;
        }
        
        submitExam(false);
    });
}

function highlightUnansweredQuestions() {
    examState.answers.forEach((answer, index) => {
        if (answer === null) {
            const questionElement = document.querySelector(`.question:nth-child(${index + 1})`);
            questionElement.style.border = '2px solid #ef4444';
            questionElement.style.animation = 'shake 0.5s ease-in-out';
            
            // Remove highlight after animation
            setTimeout(() => {
                questionElement.style.border = 'none';
            }, 2000);
        }
    });
}

function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function updateQuestionStatus(questionNumber) {
    const navButton = document.querySelector(`.question-number:nth-child(${questionNumber + 1})`);
    
    if (examState.isExamSubmitted) {
        const isCorrect = examState.answers[questionNumber] === correctAnswers[`q${questionNumber + 1}`];
        navButton.className = `question-number ${isCorrect ? 'answered' : 'incorrect'}`;
    } else {
        navButton.className = 'question-number answered';
    }
}

function updateProgressBar() {
    const answeredQuestions = examState.answers.filter(answer => answer !== null).length;
    const progress = (answeredQuestions / examConfig.totalQuestions) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
}

function calculateScore() {
    let correctCount = 0;
    for (let i = 0; i < examConfig.totalQuestions; i++) {
        if (examState.answers[i] === correctAnswers[`q${i + 1}`]) {
            correctCount++;
        }
    }
    return (correctCount / examConfig.totalQuestions) * 100;
}

function submitExam(isAutoSubmit) {
    if (examState.isExamSubmitted) return;

    // Stop the timer
    clearInterval(examState.timer);
    examState.isExamSubmitted = true;
    examState.score = calculateScore();

    // Update all question statuses
    examState.answers.forEach((_, index) => {
        updateQuestionStatus(index);
    });

    // Disable all radio buttons and submit button
    document.querySelectorAll('.option input[type="radio"], .submit-btn').forEach(element => {
        element.disabled = true;
    });

    // Show results and redirect
    showResults(isAutoSubmit);
}

function showResults(isAutoSubmit) {
    const resultMessage = isAutoSubmit ? 
        '<p style="color: #ef4444;">Time\'s up! Your exam has been automatically submitted.</p>' : 
        '<p>Exam submitted successfully!</p>';

    const modalHTML = `
        <div class="results-modal" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 90%;
            width: 400px;
        ">
            <h2 style="margin-top: 0; color: #1e293b;">Exam Results</h2>
            ${resultMessage}
            <p>Your Score: <strong>${examState.score.toFixed(1)}%</strong></p>
            <p>Status: <strong style="color: ${examState.score >= examConfig.passingScore ? '#22c55e' : '#ef4444'}">
                ${examState.score >= examConfig.passingScore ? 'PASSED' : 'FAILED'}
            </strong></p>
            <p style="color: #64748b;">Redirecting to results page in 3 seconds...</p>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        "></div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // Redirect to results page after delay
    setTimeout(() => {
        // Store exam results in sessionStorage before redirecting
        sessionStorage.setItem('examscore', JSON.stringify({
            score: examState.score,
            timeTaken: examConfig.duration - examState.timeRemaining,
            answers: examState.answers,
            timestamp: new Date().toISOString()
        }));
        
        // Redirect to results page
        window.location.href = 'examscore.html';
    }, examConfig.redirectDelay);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @keyframes slideDown {
        from { transform: translate(-50%, -100%); }
        to { transform: translate(-50%, 0); }
    }

    .question-number {
        transition: all 0.3s ease;
    }

    .option {
        transition: all 0.2s ease;
    }

    .option:hover {
        transform: translateX(5px);
    }

    .progress-fill {
        transition: width 0.5s ease;
    }
`;
document.head.appendChild(style);