// Endpoint de la API del questionnaire:
const base = "/questionnaires";

var questionnaire = "";
const cabeceras = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

function print(r) {
    const e = document.querySelector('#mensaje');
    if (r.result) {
        e.textContent = JSON.stringify(r.result);
    } else {
        e.textContent = JSON.stringify(r.error);
    }
}

function printError(s) {
    const e = document.querySelector('#mensaje');
    e.textContent = `Problema de conexión: ${s}`;
}


// function usaQuestionnaire(event) {
//     event.preventDefault(); // evita la recarga de la página
//     const e = document.querySelector("#f0 input[name='id']");
//     document.querySelector('#questionnaireId').textContent = questionnaire = e.value;
//     e.value = "";
//     muestraQuestionnaire();
// }


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
            questionnaire = r.result.questionnaireId;
            document.querySelector("#questionnaireId").textContent = questionnaire;
            document.querySelector("#f0").value = '';
            muestraQuestionnaire();
            print(r);
        })
        .catch(error => printError(error));
}


// function addQuestionnaire(el) {

//     const url2 = `${base}/${el.questionnaireId}`; 
//     fetch(url2).then(response => response.json())
//         .then(x => { 
//             const customQuestionnaire = document.createElement('encabezado-cuestionario');
//             let theme = el.name;
//             customQuestionnaire.setAttribute('data-tema', theme)
//             const formattedTheme = (theme.charAt(0).toLowerCase().toUpperCase() + theme.toLowerCase().slice(1)).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
//             let section = document.createElement('section');
//             section.id = formattedTheme;
//             section.appendChild(customQuestionnaire);
//             [...document.getElementsByClassName('questionnaires')][0].append(section)

//             //adding a nav link with the name of the questionnaire
//             const navLink = document.createElement('a');
//             navLink.setAttribute('href', `#${formattedTheme}`);
//             navLink.id = formattedTheme.toLowerCase() + '-link';
//             navLink.innerText = formattedTheme;
        
//             const navListElement = document.createElement('li');
//             navListElement.appendChild(navLink);
        
//             const nav = document.getElementsByTagName('header')[0].querySelector('ul')
//             nav.append(navListElement);

//             for (let s = 0; s < el; s++) {
//                     if (x.result[s].question) {
//                         e.innerHTML += `${x.result[s].question} ${x.result[s].answer} </tr>`;
//                     }
//             }
//         })
// }

function listAllQuestionnaires() {
    const url = `${base}`;
    fetch(url)
        .then(response => response.json())
        .then(r => {
            const e = document.querySelector('#listadoAll');
            e.innerHTML = '';
            for (let n = 0; n < r.result.length; n++) {
                addQuestionnaire(r.result[n])
                }
        })
        .catch(error => printError(error));
    }
listAllQuestionnaires()


function nuevoQuestionnaire() {
    const url = `${base}`;
    fetch(url)
        .then(response => response.json())
        .then(r => {
         addQuestionnaire(r.result[r.result.length - 1])
        })
        .catch(error => printError(error));
}


function muestraQuestionnaire() {
    nuevoQuestionnaire();
    const url = `${base}/${questionnaire}`;
    const request = {
        method: 'GET',
        headers: cabeceras,
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            // listQuestionnaires()
            const e = document.querySelector('#listado');
            e.innerHTML = '';
            if (r.result) {
                for (var i = 0; i < r.result.length; i++) {
                    e.innerHTML += `<tr>
            <td>${r.result[i].question}</td>
            <td>${r.result[i].answer}</td>
            </tr>`;
                }
            }
        })
        .catch(error => printError(error));
}


function nuevoQuestion(event) {
    event.preventDefault();
    const url = `${base}/${questionnaire}`;
    const payload = {
        question: document.querySelector("#f2 input[name='question']").value,
        answer: document.querySelector("#f2 input[name='answer']").value,
    };
    const request = {
        method: 'POST',
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            print(r);
            document.querySelector("#f2 input[name='question']").value = '';
            document.querySelector("#f2 input[name='answer']").value = '';
            muestraQuestionnaire();
        })
        .catch(error => printError(error));
}


function borraQuestion(event) {
    event.preventDefault();
    const question = document.querySelector("#f4 input[name='question']").value;
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
            print(r);
            document.querySelector("#f4 input[name='question']").value = '';
            muestraQuestionnaire();
        })
        .catch(error => printError(error));
}


function eliminaQuestionnaire(event) {
    event.preventDefault();
    const url = `${base}/${questionnaire}`;
    const payload = {};
    var request = {
        method: 'DELETE',
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url, request)
        .then(response => response.json())
        .then(r => {
            print(r);
            muestraQuestionnaire();
        })
        .catch(error => printError(error));
}


// Función de inicialización:
function init() {
    // let e = document.querySelector('#f0');
    // e.addEventListener('submit', usaQuestionnaire, false);
    e = document.querySelector('#f1');
    e.addEventListener('click', creaQuestionnaire, false);
    e = document.querySelector('#f2');
    e.addEventListener('submit', nuevoQuestion, false);
    e = document.querySelector('#f4');
    e.addEventListener('submit', borraQuestion, false);
    e = document.querySelector('#f5');
    e.addEventListener('submit', eliminaQuestionnaire, false);
}

document.addEventListener('DOMContentLoaded', init, false);