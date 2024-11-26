document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quizForm');
    const resultTable = document.getElementById('resultTable');
    const startQuizButton = document.getElementById('startQuiz');
    const quizScreen = document.getElementById('quizScreen');
    const numberDisplay = document.getElementById('number');
    const quizResult = document.getElementById('quizResult');

    let numbers = [];
    let operator = '';
    let result = 0;
    let startTime;
    let endTime;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const numberInput = document.getElementById('numberInput').value;
        operator = document.getElementById('operatorInput').value;

        numbers = numberInput.split(',').map(num => parseInt(num.trim()));
        
        updateTable();
        calculateResult();
        startQuizButton.style.display = 'block';
    });

    function updateTable() {
        const tbody = resultTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        numbers.forEach(num => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${num}</td><td>${operator}</td>`;
            tbody.appendChild(row);
        });
    }

    function calculateResult() {
        result = numbers.reduce((acc, num) => {
            switch(operator) {
                case '+': return acc + num;
                case '-': return acc - num;
                case '*': return acc * num;
                case '/': return acc / num;
                default: return acc;
            }
        });
        
        document.getElementById('result').textContent = `Result: ${result}`;
    }

    startQuizButton.addEventListener('click', startQuiz);

    function startQuiz() {
        startTime = new Date();
        quizScreen.classList.remove('hidden');
        document.documentElement.requestFullscreen().catch(err => console.log(err));
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < numbers.length) {
                numberDisplay.textContent = numbers[index];
                index++;
            } else {
                clearInterval(interval);
                setTimeout(showResult, 5000);
            }
        }, 1000);
    }

    async function saveQuizToDatabase(quizData) {
        try {
            const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save quiz');
            }
            
            const data = await response.json();
            console.log('Quiz saved successfully:', data);
        } catch (error) {
            console.error('Error saving quiz:', error);
        }
    }

    function showResult() {
        endTime = new Date();
        const speed = (endTime - startTime) / 1000; // in seconds
        
        numberDisplay.classList.add('hidden');
        quizResult.textContent = result;
        quizResult.classList.remove('hidden');
        quizResult.classList.add('celebrate');
        
        // Save quiz data to MongoDB
        const quizData = {
            rows: numbers.map(number => ({ number, operator })),
            result: result,
            speed: speed
        };
        
        saveQuizToDatabase(quizData);
        
        setTimeout(() => {
            quizScreen.classList.add('hidden');
            document.exitFullscreen().catch(err => console.log(err));
            quizResult.classList.remove('celebrate');
            quizResult.classList.add('hidden');
            numberDisplay.classList.remove('hidden');
        }, 3000);
    }
});
