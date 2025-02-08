function quizApp() {
    return {
        category: 'any',
        difficulty: 'any',
        numberOfQuestions: 10,
        questions: [],
        userAnswers: [],
        currentQuestionIndex: 0,
        score: 0,
        quizStarted: false,
        quizCompleted: false,
        selectedAnswer: null,
        isAnswerChecked: false,
        isLoading: false,
        timer: 30,
        timerInterval: null,

        get currentQuestion() {
            return this.questions[this.currentQuestionIndex];
        },

        get progressPercentage() {
            return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        },

        get questionSummary() {
            return this.questions.map((q, index) => ({
                number: index + 1,
                question: q.question,
                userAnswer: this.questions[index] === this.currentQuestion ? this.selectedAnswer : null,
                correctAnswer: q.correct_answer,
                isCorrect: this.questions[index] === this.currentQuestion ? 
                    this.selectedAnswer === q.correct_answer : false
            }));
        },

        async startQuiz() {
            this.isLoading = true;
            let apiUrl = `https://opentdb.com/api.php?amount=${this.numberOfQuestions}&type=multiple`;
            
            if (this.category !== 'any') {
                apiUrl += `&category=${this.category}`;
            }
            if (this.difficulty !== 'any') {
                apiUrl += `&difficulty=${this.difficulty}`;
            }

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                this.questions = data.results.map(q => ({
                    question: q.question,
                    options: this.shuffleArray([...q.incorrect_answers, q.correct_answer]),
                    correct_answer: q.correct_answer,
                    category: q.category,
                    difficulty: q.difficulty
                }));

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

        checkAnswer(selected) {
            if (this.isAnswerChecked) return;
            
            clearInterval(this.timerInterval);
            this.selectedAnswer = selected;
            this.isAnswerChecked = true;

            // Store the user's answer
            this.questions[this.currentQuestionIndex].userAnswer = selected;

            // Only add point if a correct answer was selected (not null/timeout)
            if (selected && selected === this.currentQuestion.correct_answer) {
                this.score = Math.min(this.score + 1, this.questions.length);
            }

            // Wait 1.5 seconds before moving to next question
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

        getDifficultyColor(difficulty) {
            const colors = {
                easy: 'text-green-600',
                medium: 'text-yellow-600',
                hard: 'text-red-600'
            };
            return colors[difficulty.toLowerCase()] || 'text-gray-600';
        },

        resetQuiz() {
            clearInterval(this.timerInterval);
            this.quizStarted = false;
            this.quizCompleted = false;
            this.questions = [];
            this.currentQuestionIndex = 0;
            this.score = 0; // Reset score to 0
            this.selectedAnswer = null;
            this.isAnswerChecked = false;
            this.timer = 30;
        },

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

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