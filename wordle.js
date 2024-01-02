const WORD_OF_THE_DAY_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATION_WORD_URL = "https://words.dev-apis.com/validate-word";

let letters = [];
let position = 1;
let row = 0; 
let answerWord = "";
let gameStatus = "in-progress";

async function init() {
    document.addEventListener("keydown", function(event) {
        console.log(event.key);
        if(gameStatus === "in-progress"){
            handleInput(event);
        }
    });
    setLoading(true);
    await getWordOfTheDay();
    setLoading(false);
}

function handleInput(event){
    if(isLetter(event.key)){
        if(position === 6){
            removeLetter();
        }
        letters[position] = event.key.toLowerCase();
        addLetterToGrid(event.key);
        position++;
    }
    else if (event.key === 'Backspace'){
        removeLetter();
    }
    else if (event.key === 'Enter' && position === 6){
        checkWord();
    }
}

function addLetterToGrid(letter){
    let id = (row*5) + position
    let box = document.getElementById("letter-" + id);
    if(box){
        box.innerText = letter;
    }
}

function removeLetter(){
    if(position > 1){
        position--;
        let id = (row * 5) + position;
        let box = document.getElementById("letter-" + id);
        if(box){
            box.innerText = "";
        }
    }
}

async function getWordOfTheDay(){
    const response = await fetch(WORD_OF_THE_DAY_URL);
    const word = await response.json();
    console.log("word of the day:", word.word);
    answerWord = word.word;
}


async function checkWord(){
    let word = ""
    for(let i = 1; i < 6; i++){
        word += letters[i];
    }
    setLoading(true);
    let validWord = await validWordCheck(word);
    setLoading(false);
    if(validWord){
        checkLetters(word); 
        if(word === answerWord){
            alert("You won!");
            let title = document.querySelector(".title");
            title.classList.add("winner");
            gameStatus = "won";
        }
        else if (word !== answerWord && row !== 5){
            row++; 
            position = 1; 
        }
        else{
            gameStatus = "lost";
            alert("You lost!");
        }
    }
    else{
        markInvalidWord();
    }
    
    console.log(word);
}

function checkLetters(word){
    let temp = answerWord; 
    for(let i = 0; i < 5; i++){
        if(word[i] === answerWord[i]){
            setBoxColor(row, i + 1, "green","white");
            if (temp.indexOf(word[i]) !== -1) {
                temp = temp.replace(word[i], ' ');
            }            
        }
        else if(temp.includes(word[i])){
            setBoxColor(row, i + 1, "yellow", "black");
            if (temp.indexOf(word[i]) !== -1) {
                temp = temp.replace(word[i], ' ');
            }
            
            console.log('"',temp,'"');
        }
        else{
            setBoxColor(row, i + 1, "grey", "white");
        }
    }
}

async function validWordCheck(word){
    let body =  { "word": word };
    let response = await fetch(VALIDATION_WORD_URL, {
                method: 'POST',
                body: JSON.stringify(body),
                });
    let validation = await response.json();
    console.log(validation);
    return validation.validWord;
}

function setBoxColor(row, column, color, textColor){
    let id = (row * 5) + column;
    let box = document.getElementById("letter-" + id);
    if(box){
        box.style.backgroundColor = color;
        box.style.color = textColor;
    }
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function markInvalidWord() {
    for (let i = 1; i < 6; i++) {
    let id = (row * 5) + i;
      document.getElementById("letter-" + id).classList.remove("invalid");

      // long enough for the browser to repaint without the "invalid class" so we can then add it again
      setTimeout(
        () => document.getElementById("letter-" + id).classList.add("invalid"),
        10
      );
    }
  }
  
function setLoading(setting){
    let symbol = document.querySelector(".info-bar");
    if(setting){
        symbol.classList.remove('hidden');
    }
    else{
        symbol.classList.add('hidden');
    }
}

init();