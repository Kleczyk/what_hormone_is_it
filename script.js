let hormones = []; // Lista hormonów
let questions = []; // Lista wszystkich pytań
let displayedQuestions = new Set(); // Zbiór wyświetlonych pytań
let selectedHormoneIndex = Math.floor(Math.random() * 11); // Indeks wylosowanego hormonu jako zmienna globalna
let new4questions = [];
let score = 0; // Zmienna do przechowywania punktacji

document.addEventListener('DOMContentLoaded', function () {
    fetchQuestions();

    document.getElementById('nextButton').addEventListener('click', function () {
        score++;
        updateScoreDisplay();
        fetchQuestions();
    });

    document.getElementById('guessHormoneButton').addEventListener('click', function () {
        showHormonesList(hormones);
    });

    setupPageNavigationButtons();
});

function setupPageNavigationButtons() {
    document.getElementById('toQuizButton').addEventListener('click', () => showPage('quiz'));
    document.getElementById('toRankingButton').addEventListener('click', () => {
        showRanking();
        showPage('ranking');
    });
    document.querySelector('.toHomeButton').addEventListener('click', resetQuiz);
    document.getElementById('submitNameButton').addEventListener('click', saveUserName);
    document.querySelector('.toHomeButtonFR').addEventListener('click', () => showPage('home'));
}


function resetQuiz() {
    score = 0; // Zerowanie wyniku
    updateScoreDisplay(); // Aktualizacja wyświetlania wyniku
    displayedQuestions.clear(); // Czyszczenie zbioru wyświetlonych pytań
    enableAllButtons(); // Włączenie wszystkich przycisków
    fetchQuestions(); // Pobranie nowych pytań
    document.getElementById('result').innerHTML = ''; // Czyszczenie wyniku
    selectedHormoneIndex = getRandomHormoneIndex(hormones.length);
    showPage('home'); // Powrót do strony głównej

}

function enableAllButtons() {
    document.getElementById('nextButton').disabled = false;
    document.getElementById('guessHormoneButton').disabled = false;
    document.querySelectorAll('.hormone-button').forEach(button => {
        button.disabled = false;
    });
    document.querySelectorAll('.question-button').forEach(button => {
        button.disabled = false;
    });
}

function fetchQuestions() {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            [hormones, ...questions] = parseCSV(data);
            console.log("hormones" ,hormones);
            console.log("questions",questions);
            loadNewQuestions();
        });
}

function loadNewQuestions() {
    // Filtruj pytania, które jeszcze nie zostały wyświetlone
    const newQuestions = questions.filter(q => !displayedQuestions.has(q[0]));

    // Znajdź pytania, które mają odpowiedź "Tak" dla wylosowanego hormonu
    const positiveQuestions = newQuestions.filter(q => q[selectedHormoneIndex] === '1');

    // Upewnij się, że przynajmniej jedno pytanie z odpowiedzią "Tak" zostanie wybrane
    const guaranteedPositiveQuestion = getRandomElements(positiveQuestions, 1)[0];

    // Wybierz 3 inne pytania, upewniając się, że nie wybierasz gwarantowanego pozytywnego pytania
    const otherQuestions = newQuestions.filter(q => q[0] !== guaranteedPositiveQuestion[0]);
    const randomQuestions = getRandomElements(otherQuestions, 3);

    // Dodaj gwarantowane pozytywne pytanie do losowych pytań
    randomQuestions.push(guaranteedPositiveQuestion);

    // Aktualizuj zbiór wyświetlonych pytań
    randomQuestions.forEach(q => displayedQuestions.add(q[0]));
    console.log("randomQuestions",randomQuestions);
    // Wyświetl wybrane pytania
    displayRandomQuestions(randomQuestions);

    // Wyczyść poprzednią odpowiedź
    document.getElementById('answer').innerHTML = '';
}
function getRandomElements(arr, count) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayRandomQuestions(Nquestions) {
    const optionsDiv = document.getElementById('options');
    new4questions = Nquestions;
    optionsDiv.innerHTML = Nquestions.map((question, index) =>
        `<button class="question-button" onclick="selectQuestion(new4questions[${index}], ${selectedHormoneIndex}, this)">${question[0]}</button>`
    ).join('');
}

function parseCSV(csv) {
    return csv.split('\n').map(row => row.split(','));
}

function getRandomHormoneIndex(length) {
    return Math.floor(Math.random() * length);
}

// function displayRandomQuestions(questions, count) {
//     const optionsDiv = document.getElementById('options');
//     const randomQuestions = getRandomElements(questions, count);
//     optionsDiv.innerHTML = randomQuestions.map((question, index) =>
//         `<button class="question-button" onclick="selectQuestion(questions[${index}], ${selectedHormoneIndex}, this)">${question[0]}</button>`
//     ).join('');
// }

function getRandomElements(arr, count) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function selectQuestion(question, hormoneIndex, button) {
    console.log(question);
    disableQuestionButtons();
    answerQuestion(question, hormoneIndex);
}

function removeQuestionFromAvailable(selectedQuestion) {
    availableQuestions = availableQuestions.filter(q => q[0] !== selectedQuestion[0]);
}

function disableQuestionButtons() {
    document.querySelectorAll('.question-button').forEach(button => {
        button.disabled = true;
    });
}

function answerQuestion(question, hormoneIndex) {
    const answerDiv = document.getElementById('answer');
    console.log("hormones" ,hormones[hormoneIndex]);
    console.log("hormoneeIndex" ,hormoneIndex);
    console.log("hormones" ,question);
    const answer = question[hormoneIndex] === '1' ? 'Tak' : 'Nie';
    answerDiv.innerHTML = `Odpowiedź: ${answer}`;
}

function showHormonesList(hormones) {
    const hormonesDiv = document.getElementById('hormones');
    hormonesDiv.style.display = 'block';

    hormonesDiv.innerHTML = hormones.map(hormone =>
        `<button class="hormone-button" onclick="guessHormone('${hormone}')">${hormone}</button>`
    ).join('');
}

function guessHormone(selectedHormone) {
    const correctHormone = hormones[selectedHormoneIndex];
    const resultDiv = document.getElementById('result');
    const hormonesDiv = document.getElementById('hormones');

    if (selectedHormone === correctHormone) {
        resultDiv.innerHTML = 'Poprawnie! To był ' + selectedHormone + '.';
        score++; // Inkrementacja wyniku tylko w przypadku poprawnej odpowiedzi
        updateScoreDisplay();
        saveScore(); // Zapisywanie wyniku po poprawnej odpowiedzi
    } else {
        resultDiv.innerHTML = 'Niepoprawnie. Prawidłowym hormonem był ' + correctHormone + '.';
    }

    // Ukrywanie listy hormonów
    hormonesDiv.style.display = 'none';

    // Blokowanie przycisków po wyborze odpowiedzi
    disableButtonsAfterGuess();
}

function disableButtonsAfterGuess() {
    document.getElementById('nextButton').disabled = true;
    document.getElementById('guessHormoneButton').disabled = true;
 
}


function updateScoreDisplay() {
    document.getElementById('score').innerHTML = 'Punkty: ' + score;
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}

function saveUserName() {
    const userName = document.getElementById('userNameInput').value;
    localStorage.setItem('currentUserName', userName);
}

function saveScore() {
    const userName = localStorage.getItem('currentUserName') || 'Anonimowy';
    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    scores[userName] = (scores[userName] || 0) + score;
    localStorage.setItem('scores', JSON.stringify(scores));
}


function showRanking() {
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);

    let rankingHTML = '<ul>';
    for (const [name, score] of sortedScores) {
        rankingHTML += `<li>${name}: ${score} punktów</li>`;
    }
    rankingHTML += '</ul>';

    document.getElementById('rankingList').innerHTML = rankingHTML;
}

