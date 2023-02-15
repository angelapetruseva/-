// Endpoint de la API del questionnaire:
const base = "/questionnaires";

var questionnaire = "";
const cabeceras = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

function creaQuestionnaire(event) {
    event.preventDefault();
    const url = `${base}`;
    const payload = {
        name:document.querySelector("#f0").value
    };
    const request = {
        method: 'POST',
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            document.querySelector("#f0").value = '';
            nuevoQuestionnaire(questionnaire)
        })
}


function muestraQuestionnaire(questionnaire, button) {
    const url = `${base}/${questionnaire}`;
    const request = {
        method: 'GET',
        headers: cabeceras,
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            if (r.result) {
                const lastQuestion = r.result[r.result.length - 1]
                addPregunta(lastQuestion.question, lastQuestion.answer, button, questionnaire)
                }
        })
        
}

function listAllQuestions (questionnaire, button) {
    fetch(`${base}/${questionnaire}`)
    .then(response => response.json())
    .then(s => {                            
        if (s.result) {
            for (var i = 0; i < s.result.length; i++) {
                addPregunta(s.result[i].question, s.result[i].answer, button, questionnaire)
            }
        }
    })
}

function listAllQuestionnaires() {
    const url = `${base}`;
    fetch(url)
        .then(response => response.json())
        .then(r => {
            r.result.forEach(element => {
                addQuestionnaire(element)
            });
        })
    }
listAllQuestionnaires()


function nuevoQuestionnaire() {
    const url = `${base}`;
    fetch(url)
        .then(response => response.json())
        .then(r => {
            const lastQuestionnaire = r.result[r.result.length - 1]
            addQuestionnaire(lastQuestionnaire)
        })
        
}


function nuevoQuestion(event, questionnaire, button) {
    event.preventDefault();
    const url = `${base}/${questionnaire}`;
    const answer = event.target.parentNode.parentNode.children[1].children[1].checked;

    const payload = {
        question: event.target.parentNode.parentNode.children[0].children[1].value,
        answer: answer.toString()
    };
    const request = {
        method: 'POST',
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            
            muestraQuestionnaire(questionnaire, button);

        })
        
        event.target.parentNode.parentNode.children[0].children[1].value = ''
        event.target.parentNode.parentNode.children[1].children[1].checked = true
}


function eliminaQuestionnaire(id, button) {
    // event.preventDefault();
    const url = `${base}/${id}`;
    const payload = {};
    var request = {
        method: 'DELETE',
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {            
            const supressed = document.getElementById(id)
            document.getElementById(`${supressed.parentNode.id.toLowerCase()}-link`).remove()
            supressed.parentElement.remove()
        })
}


function borraQuestion(event, question, button) {
    const questionnaire = button.parentNode.id
    event.preventDefault();
    const url = `${base}/${questionnaire}/${question}`;
    const payload = {};
    var request = {
        method: 'DELETE',
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            
            if (button.parentNode.parentNode.children.length > 5) {
                button.parentNode.remove()
            } else {
            eliminaQuestionnaire(questionnaire, button)
            }
        })
        
}

// Función de inicialización:
function init() {
    let e = document.querySelector('#f1');
    e.addEventListener('click', creaQuestionnaire, false);
}

document.addEventListener('DOMContentLoaded', init, false);