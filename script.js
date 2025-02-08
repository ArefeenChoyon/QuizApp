/**
 * Quiz Application Main Function
 * This function initializes and manages the entire quiz application state and behavior
 */
function quizApp() {
    return {
        // Initial State Properties
        category: 'any',          // Selected quiz category
        difficulty: 'any',        // Selected difficulty level
        numberOfQuestions: 10,    // Default number of questions
        questions: [],            // Array to store quiz questions
        userAnswers: [],          // Array to store user's answers
        currentQuestionIndex: 0,  // Current question being displayed
        score: 0,                 // User's current score
        quizStarted: false,       // Quiz state flag
        quizCompleted: false,     // Quiz completion flag
        selectedAnswer: null,     // Currently selected answer
        isAnswerChecked: false,   // Flag to prevent multiple answers
        isLoading: false,         // Loading state flag
        timer: 30,                // Question timer in seconds
        timerInterval: null,      // Timer interval reference

        /**
         * Computed Properties
         */
        // Get current question object
        get currentQuestion() {
            return this.questions[this.currentQuestionIndex];
        },

        // Calculate progress percentage
        get progressPercentage() {
            return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        },

        // Get formatted question summary for results
        get questionSummary() {
            return this.questions.map((q, index) => ({
                number: index + 1,
                question: q.question,
                userAnswer: q.userAnswer || 'No answer',
                correctAnswer: q.correct_answer,
                isCorrect: q.userAnswer === q.correct_answer
            }));
        },

        /**
         * Quiz Initialization
         * Fetches questions from the API and sets up the quiz
         */
        async startQuiz() {
            this.isLoading = true;
            let apiUrl = `https://opentdb.com/api.php?amount=${this.numberOfQuestions}&type=multiple`;
            
            // Add optional parameters if selected
            if (this.category !== 'any') {
                apiUrl += `&category=${this.category}`;
            }
            if (this.difficulty !== 'any') {
                apiUrl += `&difficulty=${this.difficulty}`;
            }

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                // Format questions data
                this.questions = data.results.map(q => ({
                    question: q.question,
                    options: this.shuffleArray([...q.incorrect_answers, q.correct_answer]),
                    correct_answer: q.correct_answer,
                    category: q.category,
                    difficulty: q.difficulty
                }));

                // Initialize quiz state
                this.quizStarted = true;
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.quizCompleted = false;
                this.startTimer();
            } catch (error) {
                console.error('Error fetching questions:', error);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Timer Management
         * Handles the countdown timer for each question
         */
        startTimer() {
            this.timer = 30;
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                if (this.timer > 0) {
                    this.timer--;
                } else {
                    this.checkAnswer(null); // Time's up
                }
            }, 1000);
        },

        /**
         * Answer Processing
         * Handles user answer selection and scoring
         * @param {string} selected - The selected answer
         */
        checkAnswer(selected) {
            if (this.isAnswerChecked) return;
            
            clearInterval(this.timerInterval);
            this.selectedAnswer = selected;
            this.isAnswerChecked = true;

            // Store user's answer
            this.questions[this.currentQuestionIndex].userAnswer = selected;

            // Score calculation
            if (selected && selected === this.currentQuestion.correct_answer) {
                this.score = Math.min(this.score + 1, this.questions.length);
            }

            // Move to next question after delay
            setTimeout(() => {
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.currentQuestionIndex++;
                    this.selectedAnswer = null;
                    this.isAnswerChecked = false;
                    this.startTimer();
                } else {
                    this.quizCompleted = true;
                    clearInterval(this.timerInterval);
                }
            }, 1500);
        },

        /**
         * UI Helper Methods
         */
        // Get classes for option buttons based on state
        getButtonClasses(option) {
            const baseClasses = 'w-full p-4 text-left rounded-lg transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2';
            
            if (!this.isAnswerChecked) {
                return `${baseClasses} border border-gray-300 hover:bg-gray-50 hover:shadow-md`;
            }

            if (option === this.currentQuestion.correct_answer) {
                return `${baseClasses} border-2 border-green-500 bg-green-100 text-green-800 font-semibold`;
            }

            if (option === this.selectedAnswer && option !== this.currentQuestion.correct_answer) {
                return `${baseClasses} border-2 border-red-500 bg-red-100 text-red-800`;
            }

            return `${baseClasses} border border-gray-300 opacity-50`;
        },

        // Get color classes for difficulty badges
        getDifficultyColor(difficulty) {
            const colors = {
                easy: 'text-green-600',
                medium: 'text-yellow-600',
                hard: 'text-red-600'
            };
            return colors[difficulty.toLowerCase()] || 'text-gray-600';
        },

        /**
         * Quiz Reset
         * Resets the quiz state to initial values
         */
        resetQuiz() {
            clearInterval(this.timerInterval);
            this.quizStarted = false;
            this.quizCompleted = false;
            this.questions = [];
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.selectedAnswer = null;
            this.isAnswerChecked = false;
            this.timer = 30;
        },

        /**
         * Utility Methods
         */
        // Shuffle array elements (Fisher-Yates algorithm)
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        // Format results for printing
        getPrintableResults() {
            return this.questions.map((q, index) => ({
                number: index + 1,
                question: q.question,
                userAnswer: q.userAnswer || 'No answer',
                correctAnswer: q.correct_answer,
                isCorrect: q.userAnswer === q.correct_answer
            }));
        }
    }
} 