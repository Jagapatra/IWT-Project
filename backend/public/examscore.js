// Define grade boundaries
const gradeBoundaries = {
    A: 90,
    B: 80,
    C: 70,
    D: 60,
    F: 0
};

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve exam results from sessionStorage
    const examResults = JSON.parse(sessionStorage.getItem('examResults'));
    
    if (!examResults) {
        handleNoResults();
        return;
    }

    displayResults(examResults);
});

function handleNoResults() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h2>No Exam Results Found</h2>
        <p>Please take an exam first to view your results.</p>
        <a href="./e-exam.html" class="btn">Take Exam</a>
        <a href="./index.html" class="go-home-btn">Go to Home</a>
    `;
}

function displayResults(results) {
    // Update score display
    updateScoreDisplay(results.score);
    
    // Update results table
    updateResultsTable(results.answers);
    
    // Update feedback based on score
    updateFeedback(results.score, results.timeTaken);
    
    // Update buttons and links
    updateNavigationButtons(results);
}

function updateScoreDisplay(score) {
    const scoreElement = document.querySelector('.score');
    const grade = calculateGrade(score);
    
    scoreElement.innerHTML = `
        <p>Your Exam Score: <strong>${score.toFixed(1)}/100</strong></p>
        <p>Grade: <strong style="color: ${getGradeColor(grade)}">${grade}</strong></p>
        <p>Status: <strong style="color: ${score >= 70 ? '#28a745' : '#dc3545'}">
            ${score >= 70 ? 'PASSED' : 'FAILED'}
        </strong></p>
    `;
}

function calculateGrade(score) {
    if (score >= gradeBoundaries.A) return 'A';
    if (score >= gradeBoundaries.B) return 'B';
    if (score >= gradeBoundaries.C) return 'C';
    if (score >= gradeBoundaries.D) return 'D';
    return 'F';
}

function getGradeColor(grade) {
    const gradeColors = {
        'A': '#28a745', // Green
        'B': '#17a2b8', // Blue
        'C': '#ffc107', // Yellow
        'D': '#fd7e14', // Orange
        'F': '#dc3545'  // Red
    };
    return gradeColors[grade] || '#6c757d';
}

function updateResultsTable(answers) {
    // Define correct answers (same as in exam.js)
    const correctAnswers = {
        q1: 1, // "Hyper Text Markup Language"
        q2: 0, // "<a>"
        q3: 1  // "<p>"
    };

    // Get answer text mappings
    const answerTexts = {
        q1: ['Hyper Text Markup Level', 'Hyper Text Markup Language', 'Hyper Text Making Language'],
        q2: ['<a>', '<link>', '<href>'],
        q3: ['<paragraph>', '<p>', '<para>']
    };

    const tbody = document.querySelector('.results-table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    answers.forEach((answer, index) => {
        const questionNumber = index + 1;
        const userAnswer = answerTexts[`q${questionNumber}`][answer];
        const correctAnswer = answerTexts[`q${questionNumber}`][correctAnswers[`q${questionNumber}`]];
        const isCorrect = answer === correctAnswers[`q${questionNumber}`];

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${questionNumber}</td>
            <td>${userAnswer || 'Not answered'}</td>
            <td>${correctAnswer}</td>
            <td style="color: ${isCorrect ? '#28a745' : '#dc3545'}">
                ${isCorrect ? 'Correct' : 'Incorrect'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateFeedback(score, timeTaken) {
    const feedbackElement = document.querySelector('.feedback');
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    let feedback = '';
    if (score >= 90) {
        feedback = 'Excellent work! You\'ve demonstrated a thorough understanding of the material.';
    } else if (score >= 70) {
        feedback = 'Good job! While you\'ve passed, there\'s room for improvement in some areas.';
    } else {
        feedback = 'Keep practicing! Review the topics where you had difficulty and try again.';
    }

    feedbackElement.innerHTML = `
        <h3>Performance Analysis</h3>
        <p>${feedback}</p>
        <p>Time taken: ${minutes} minutes ${seconds} seconds</p>
        ${score < 70 ? '<p>Note: A minimum score of 70% is required to pass.</p>' : ''}
    `;
}

function updateNavigationButtons(results) {
    const container = document.querySelector('.container');
    const existingButtons = container.querySelectorAll('.btn, .go-home-btn');
    
    // Remove existing buttons
    existingButtons.forEach(button => button.remove());
    
    // Add new buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '2rem';
    
    // Review button (only if failed)
    if (results.score < 70) {
        const reviewButton = createButton('Review Material', './study-material.html', 'btn');
        buttonContainer.appendChild(reviewButton);
    }
    
    // Retake button
    const retakeButton = createButton('Retake Exam', './e-exam.html', 'btn');
    buttonContainer.appendChild(retakeButton);
    
    // Home button
    const homeButton = createButton('Go to Home', './index.html', 'go-home-btn');
    buttonContainer.appendChild(homeButton);
    
    container.appendChild(buttonContainer);
}

function createButton(text, href, className) {
    const button = document.createElement('a');
    button.href = href;
    button.className = className;
    button.textContent = text;
    button.style.margin = '0 10px';
    return button;
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    .score, .feedback, .results-table {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.5s ease forwards;
    }

    .score { animation-delay: 0.2s; }
    .feedback { animation-delay: 0.4s; }
    .results-table { animation-delay: 0.6s; }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .results-table tr {
        transition: background-color 0.3s ease;
    }

    .btn, .go-home-btn {
        transform: scale(1);
        transition: transform 0.3s ease;
    }

    .btn:hover, .go-home-btn:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);