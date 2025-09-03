// DOM Elements
const saveFlashcardBtn = document.getElementById("saveFlashcardBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const addFolderBtn = document.getElementById("addFolderBtn");
const folderSelect = document.getElementById("folderSelect");
const newFolderNameInput = document.getElementById("newFolderName");
const foldersContainer = document.getElementById("foldersContainer");
const flashcardsContainer = document.getElementById("flashcardsContainer");
const statsDisplay = document.getElementById("statsDisplay");
const currentFolderNameDisplay = document.getElementById("currentFolderName");
const studyMode = document.getElementById("studyMode");
const studyCard = document.getElementById("studyCard");
const closeStudyBtn = document.getElementById("closeStudy");
const flipStudyCardBtn = document.getElementById("flipStudyCardBtn");
const studyAllBtn = document.getElementById("studyAllBtn");
const toast = document.getElementById("toast");

// --- START: Quiz Mode DOM Elements ---
const quizMode = document.getElementById("quizMode");
const closeQuizBtn = document.getElementById("closeQuiz");
const quizContent = document.getElementById("quizContent");
const quizResults = document.getElementById("quizResults");
const quizProgress = document.getElementById("quizProgress");
const quizQuestionTitle = document.getElementById("quizQuestionTitle");
const quizQuestionContent = document.getElementById("quizQuestionContent");
const quizAnswerInput = document.getElementById("quizAnswerInput");
const submitQuizAnswerBtn = document.getElementById("submitQuizAnswerBtn");
const quizFeedbackArea = document.getElementById("quizFeedbackArea");
const feedbackTitle = document.getElementById("feedbackTitle");
const correctAnswer = document.getElementById("correctAnswer");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const finalScore = document.getElementById("finalScore");
const restartQuizBtn = document.getElementById("restartQuizBtn");
// --- END: Quiz Mode DOM Elements ---

// State
let flashcards = JSON.parse(localStorage.getItem("cognideck-flashcards")) || [];
let folders = JSON.parse(localStorage.getItem("cognideck-folders")) || ["Default"];
let activeFolder = "Default";
let studySessionCards = [];
let currentStudyCardIndex = 0;

// --- START: Quiz State ---
let quizSessionCards = [];
let currentQuizCardIndex = 0;
let quizScore = 0;
// --- END: Quiz State ---

// --- NEW: Stop words list for keyword filtering ---
const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];


// Initialize
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    renderFolders();
    renderFlashcards();
    updateFolderDropdown();

    // Event Listeners
    saveFlashcardBtn.addEventListener("click", saveFlashcard);
    addFolderBtn.addEventListener("click", addNewFolder);
    clearFormBtn.addEventListener("click", clearForm);
    closeStudyBtn.addEventListener("click", closeStudySession);
    flipStudyCardBtn.addEventListener("click", flipStudyCard);
    studyAllBtn.addEventListener("click", () => startStudySession(flashcards));

    // --- START: Quiz Event Listeners ---
    closeQuizBtn.addEventListener("click", endQuiz);
    submitQuizAnswerBtn.addEventListener("click", checkQuizAnswer);
    nextQuestionBtn.addEventListener("click", nextQuestion);
    restartQuizBtn.addEventListener("click", () => startQuiz(quizSessionCards));
    quizAnswerInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !submitQuizAnswerBtn.hidden) {
            submitQuizAnswerBtn.click();
        }
    });
    // --- END: Quiz Event Listeners ---
}

// Folder Functions
function addNewFolder() {
    const newFolderName = newFolderNameInput.value.trim();
    if (newFolderName && !folders.includes(newFolderName)) {
        folders.push(newFolderName);
        saveFolders();
        renderFolders();
        updateFolderDropdown();
        newFolderNameInput.value = "";
        showToast(`Folder "${newFolderName}" created!`, "success");
        setActiveFolder(newFolderName);
    } else if (folders.includes(newFolderName)) {
        showToast("Folder with this name already exists.", "error");
    } else {
        showToast("Please enter a folder name.", "error");
    }
}

function renderFolders() {
    foldersContainer.innerHTML = "";
    folders.forEach(folderName => {
        const folderElement = document.createElement("div");
        folderElement.className = "folder";
        folderElement.dataset.folder = folderName;
        if (folderName === activeFolder) {
            folderElement.classList.add("active");
        }

        const folderNameSpan = document.createElement('span');
        folderNameSpan.className = 'folder-name';
        folderNameSpan.textContent = folderName;
        folderNameSpan.addEventListener("click", () => setActiveFolder(folderName));

        const folderActionsDiv = document.createElement('div');
        folderActionsDiv.className = 'folder-actions';

        const quizBtn = document.createElement('button');
        quizBtn.className = 'folder-quiz-btn';
        quizBtn.innerHTML = '<i class="fas fa-graduation-cap"></i>';
        quizBtn.title = `Quiz "${folderName}" folder`;
        quizBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cardsForQuiz = flashcards.filter(card => card.folder === folderName);
            startQuiz(cardsForQuiz);
        });
        folderActionsDiv.appendChild(quizBtn);

        if (folderName !== "Default") {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-folder-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = `Delete "${folderName}" folder`;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFolder(folderName);
            });
            folderActionsDiv.appendChild(deleteBtn);
        }

        folderElement.appendChild(folderNameSpan);
        folderElement.appendChild(folderActionsDiv);
        foldersContainer.appendChild(folderElement);
    });
}


function setActiveFolder(folderName) {
    activeFolder = folderName;
    renderFolders();
    renderFlashcards();
    updateFolderDropdown();
}

function updateFolderDropdown() {
    folderSelect.innerHTML = "";
    folders.forEach(folderName => {
        const option = document.createElement("option");
        option.value = folderName;
        option.textContent = folderName;
        folderSelect.appendChild(option);
    });
    folderSelect.value = activeFolder;
}

function deleteFolder(folderName) {
    if (folderName === "Default") {
        showToast("The 'Default' folder cannot be deleted.", "error");
        return;
    }

    if (window.confirm(`Are you sure you want to delete the "${folderName}" folder and all its flashcards? This action cannot be undone.`)) {
        flashcards = flashcards.filter(card => card.folder !== folderName);
        folders = folders.filter(f => f !== folderName);

        saveFlashcards();
        saveFolders();

        if (activeFolder === folderName) {
            activeFolder = "Default";
        }

        setActiveFolder(activeFolder);
        showToast(`Folder "${folderName}" was deleted.`, "success");
    }
}

// Flashcard Functions
function saveFlashcard() {
    const title = document.getElementById("flashcardTitle").value.trim();
    const front = document.getElementById("flashcardFront").value.trim();
    const back = document.getElementById("flashcardBack").value.trim();
    const folder = folderSelect.value;
    const editingId = saveFlashcardBtn.dataset.editingId;

    if (!title || !front || !back) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

    if (editingId) {
        const cardIndex = flashcards.findIndex(card => card.id === editingId);
        if (cardIndex > -1) {
            flashcards[cardIndex] = { ...flashcards[cardIndex], title, front, back, folder };
            showToast("Flashcard updated successfully!", "success");
        }
        delete saveFlashcardBtn.dataset.editingId;
        saveFlashcardBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    } else {
        const newFlashcard = {
            id: Date.now().toString(),
            title,
            front,
            back,
            folder,
            createdAt: new Date().toISOString(),
        };
        flashcards.push(newFlashcard);
        showToast("Flashcard saved successfully!", "success");
    }

    saveFlashcards();
    setActiveFolder(folder);
    clearForm();
}

function renderFlashcards() {
    currentFolderNameDisplay.textContent = activeFolder;
    const cardsInFolder = flashcards.filter(card => card.folder === activeFolder);
    updateStats(cardsInFolder.length);

    if (cardsInFolder.length === 0) {
        flashcardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>This Folder is Empty</h3>
                <p>Create a new flashcard to add it to this folder.</p>
            </div>`;
        return;
    }

    flashcardsContainer.innerHTML = "";
    cardsInFolder.forEach(card => {
        const flashcardElement = document.createElement("div");
        flashcardElement.className = "flashcard";
        flashcardElement.dataset.id = card.id;
        flashcardElement.innerHTML = `
            <div class="flashcard-content">
                <h3 class="flashcard-title">${card.title}</h3>
                <p class="flashcard-body">${card.front}</p>
                <div class="flashcard-actions">
                    <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                    <button class="study-btn" title="Study"><i class="fas fa-graduation-cap"></i></button>
                </div>
            </div>`;
        flashcardsContainer.appendChild(flashcardElement);

        flashcardElement.querySelector(".edit-btn").addEventListener("click", () => editFlashcard(card.id));
        flashcardElement.querySelector(".delete-btn").addEventListener("click", () => deleteFlashcard(card.id));
        flashcardElement.querySelector(".study-btn").addEventListener("click", () => startStudySession([card]));
    });
}

function editFlashcard(id) {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;

    document.getElementById("flashcardTitle").value = card.title;
    document.getElementById("flashcardFront").value = card.front;
    document.getElementById("flashcardBack").value = card.back;
    folderSelect.value = card.folder;

    saveFlashcardBtn.dataset.editingId = id;
    saveFlashcardBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    document.getElementById('flashcardTitle').focus();
}

function deleteFlashcard(id) {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
        flashcards = flashcards.filter(card => card.id !== id);
        saveFlashcards();
        renderFlashcards();
        showToast("Flashcard deleted.", "success");
    }
}

// Study Session Functions
function startStudySession(cards) {
    if (cards.length === 0) {
        showToast("No cards to study in this session!", "warning");
        return;
    }
    studySessionCards = [...cards].sort(() => Math.random() - 0.5);
    currentStudyCardIndex = 0;
    studyMode.classList.add("active");
    updateStudyCard();
}

function updateStudyCard() {
    if (studySessionCards.length === 0) return;
    const card = studySessionCards[currentStudyCardIndex];
    document.getElementById("studyFrontTitle").innerText = card.title;
    document.getElementById("studyFrontContent").innerText = card.front;
    document.getElementById("studyBackContent").innerText = card.back;
    studyCard.classList.remove("flipped");
}

function closeStudySession() {
    studyMode.classList.remove("active");
    studyCard.classList.remove("flipped");
}

function flipStudyCard() {
    studyCard.classList.toggle("flipped");
}

// --- START: Quiz Functions ---
function startQuiz(cards) {
    if (cards.length === 0) {
        showToast("There are no cards in this folder to start a quiz.", "warning");
        return;
    }

    quizSessionCards = [...cards].sort(() => Math.random() - 0.5); // Shuffle cards
    currentQuizCardIndex = 0;
    quizScore = 0;

    quizResults.style.display = 'none';
    quizContent.style.display = 'flex';
    quizMode.classList.add("active");

    displayQuestion();
}

function displayQuestion() {
    const card = quizSessionCards[currentQuizCardIndex];
    quizProgress.textContent = `Question ${currentQuizCardIndex + 1} / ${quizSessionCards.length}`;
    quizQuestionTitle.textContent = card.title;
    quizQuestionContent.textContent = card.front;

    quizAnswerInput.value = '';
    quizAnswerInput.disabled = false;
    submitQuizAnswerBtn.style.display = 'block';
    quizFeedbackArea.style.display = 'none';
    quizAnswerInput.focus();
}

/**
 * NEW - Utility function to process text into a set of keywords.
 * It converts to lowercase, removes punctuation, splits into words,
 * and filters out common "stop words".
 * @param {string} text The text to process.
 * @returns {Set<string>} A set of essential keywords.
 */
function getKeywords(text) {
    const words = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/);

    return new Set(words.filter(word => word && !stopWords.includes(word)));
}

function checkQuizAnswer() {
    const userAnswer = quizAnswerInput.value;
    const correctAnswerText = quizSessionCards[currentQuizCardIndex].back;

    quizAnswerInput.disabled = true;
    submitQuizAnswerBtn.style.display = 'none';
    quizFeedbackArea.style.display = 'block';
    correctAnswer.textContent = correctAnswerText;

    // --- REVISED LOGIC: START ---
    const correctKeywords = getKeywords(correctAnswerText);
    const userKeywords = getKeywords(userAnswer);

    // If there are no essential keywords in the correct answer, require an exact match.
    if (correctKeywords.size === 0) {
        if (userAnswer.trim().toLowerCase() === correctAnswerText.trim().toLowerCase()) {
            isCorrect = true;
        } else {
            isCorrect = false;
        }
    } else {
        // Otherwise, check if all essential keywords from the correct answer are present in the user's answer.
        isCorrect = [...correctKeywords].every(keyword => userKeywords.has(keyword));
    }
    // --- REVISED LOGIC: END ---

    if (isCorrect) {
        quizScore++;
        feedbackTitle.textContent = "Correct!";
        quizFeedbackArea.className = "quiz-feedback-area correct";
    } else {
        feedbackTitle.textContent = "Incorrect!";
        quizFeedbackArea.className = "quiz-feedback-area incorrect";
    }

    if (currentQuizCardIndex >= quizSessionCards.length - 1) {
        nextQuestionBtn.textContent = "Show Results";
    } else {
        nextQuestionBtn.textContent = "Next Question";
    }
}


function nextQuestion() {
    currentQuizCardIndex++;
    if (currentQuizCardIndex < quizSessionCards.length) {
        displayQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    quizContent.style.display = 'none';
    quizResults.style.display = 'flex';
    finalScore.textContent = `${quizScore} / ${quizSessionCards.length}`;
}

function endQuiz() {
    quizMode.classList.remove("active");
}
// --- END: Quiz Functions ---

// Utility Functions
function saveFlashcards() {
    localStorage.setItem("cognideck-flashcards", JSON.stringify(flashcards));
}

function saveFolders() {
    localStorage.setItem("cognideck-folders", JSON.stringify(folders));
}

function updateStats(count) {
    statsDisplay.textContent = `${count} flashcard${count !== 1 ? "s" : ""}`;
}

function clearForm() {
    document.getElementById("flashcardTitle").value = "";
    document.getElementById("flashcardFront").value = "";
    document.getElementById("flashcardBack").value = "";
    delete saveFlashcardBtn.dataset.editingId;
    saveFlashcardBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    folderSelect.value = activeFolder;
}

function showToast(message, type = "") {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}