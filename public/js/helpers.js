//ADD QUESTIONNAIRES
function addQuestionnaire(el) {

    const url2 = `${base}/${el.questionnaireId}`; 
    fetch(url2).then(response => response.json())
        .then(x => { 
            const customQuestionnaire = document.createElement('encabezado-cuestionario');
            let theme = el.name;
            customQuestionnaire.setAttribute('data-tema', theme);
            customQuestionnaire.id = el.questionnaireId;
            const formattedTheme = (theme.charAt(0).toLowerCase().toUpperCase() + theme.toLowerCase().slice(1)).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            let section = document.createElement('section');
            section.id = formattedTheme;
            section.appendChild(customQuestionnaire);
            [...document.getElementsByClassName('questionnaires')][0].append(section)

            //adding a nav link with the name of the questionnaire
            const navLink = document.createElement('a');
            navLink.setAttribute('href', `#${formattedTheme}`);
            navLink.id = formattedTheme.toLowerCase() + '-link';
            navLink.innerText = formattedTheme;
        
            const navListElement = document.createElement('li');
            navListElement.appendChild(navLink);
        
            const nav = document.getElementsByTagName('header')[0].querySelector('ul')
            nav.append(navListElement);

            for (let s = 0; s < el; s++) {
                    if (x.result[s].question) {
                        e.innerHTML += `${x.result[s].question} ${x.result[s].answer} </tr>`;
                    }
            }
        })
}

// RESTORE QUESTIONS
// let supressedQuestions = [];
// const restoreQuestions = (e, parent) => {
//     supressedQuestions.forEach(quest =>{ 
//         if(Object.values(quest)[1] === parent) {
//         Object.values(quest)[1].appendChild(Object.values(quest)[0])
//         supressedQuestions = [];
//         }
//     });
// };

//ADD FORM FOR QUESTIONS
const addFormPregunta = () => {

    const form = document.createElement('div');
    form.className = 'formulario';
    const ul = document.createElement('ul');
    const li1 = document.createElement('li');
    const li2 = document.createElement('li');
    const li3 = document.createElement('li');
    const label1 = document.createElement('label');
    label1.innerHTML = 'Прашање:';
    const input1 = document.createElement('input');
    input1.setAttribute('type', 'text');
    input1.setAttribute('name', '');
    const label2 = document.createElement('label');
    label2.innerHTML = 'Одговор:';
    const input2 = document.createElement('input');
    input2.setAttribute('type', 'radio');
    input2.setAttribute('name', 'paris_respuesta');
    input2.setAttribute('value', 'verdadero');
    input2.setAttribute('checked', true);
    const p1 = document.createElement('span');
    p1.innerText = 'Точно'
    const input3 = document.createElement('input');
    input3.setAttribute('type', 'radio');
    input3.setAttribute('name', 'paris_respuesta');
    input3.setAttribute('value', 'falso');
    const p2 = document.createElement('span');
    p2.innerText = 'Неточно'
    const input4 = document.createElement('input');
    input4.setAttribute('type', 'button');
    input4.setAttribute('value', 'Додади ново прашање');

    form.append(ul);
    ul.append(li1);
    ul.append(li2);
    ul.append(li3);
    li1.append(label1);
    li1.append(input1);
    li2.append(label2)
    li2.append(input2)
    li2.append(p1)
    li2.append(input3)
    li2.append(p2)
    li3.append(input4);

    return form;

}

//ADD QUESTIONS
const addPregunta = (question, answer, button, id) => {

    // if (e.key === 'Enter' || e.target.value === 'Añadir nueva pregunta') {

        const questionnaire = button.parentNode.parentNode.parentNode.parentNode;


            const bloque = document.createElement('div');
            bloque.className = 'bloque';
            bloque.id = id

            const pregunta = document.createElement('div');
            pregunta.className = 'pregunta';

            const theme = document.createElement('div');
            theme.className = 'theme';

            const respuesta = document.createElement('div');
            respuesta.className = 'respuesta';

            bloque.appendChild(pregunta);
            bloque.appendChild(theme);
            bloque.appendChild(respuesta);
            questionnaire.append(bloque);

            bloque.children[1].innerText = question.toLowerCase().charAt(0).toUpperCase() + question.toLowerCase().slice(1);

            answer == "true"
                ? bloque.children[2].setAttribute('data-valor', 'true')
                : bloque.children[2].setAttribute('data-valor', 'false')

            const el = document.createElement('div');
            el.className = 'borra';
            el.innerHTML = '&#9746';
            el.addEventListener("click", function (e) {
                borraQuestion(e, question, el);
            }, false);
            bloque.prepend(el);

        // } else {
        //     alert('Please type a question before submiting!');
        // };
    };
// };