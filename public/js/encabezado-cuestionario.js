//WEB COMPONENT
class Cuestionario extends HTMLElement {
  static get observedAttributes() {
    return ['theme'];
  }
  constructor() {

    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });

    var style = document.createElement('style');
    style.textContent = `
      .formulario {
        counter-reset: pregunta;
      }

      .formulario ul {
          list-style-type: none;
          padding: 0;
          margin: 30px 0 20px 0;
      }
      
      .formulario ul li {
          padding: 12px;
          border-bottom: 1px solid #eee;
      }
      
      .formulario ul li:first-child {
          border-top: 1px solid #777;
      }
      
      .formulario ul li:last-child {
          border-bottom: 1px solid #777
      }
      
      .formulario ul li label {
          display: inline-block;
          width: 15em;
      }
      
      .formulario ul li input {
          border: 1px solid #aaa;
      }
      
      .formulario ul li input[type="text"],
      input[type="url"] {
          box-shadow: 0px 0px 3px #ccc, 0 5px 8px #eee inset;
          border-radius: 2px;
      }

      .borra {
          cursor: pointer;
          position: absolute;
          right: 2px;
          top: 1px;
      }

      .bloque {
          background-color: whitesmoke;
          border: 1px solid lightgray;
          margin: 10px 0 20px;
          box-shadow: 6px 6px 3px slategray;
          padding: 10px;
          position: relative;
      }
      
      .pregunta {
          margin: 0 1ex 1ex;
          line-height: 2rem;
      }

      .theme {
          margin: 0 1ex 1ex;
          line-height: 2rem;
      }
      
      .respuesta {
          margin: 0 1ex 1ex;
          line-height: 2rem;
      }
      
      .pregunta::before {
          counter-increment: pregunta;
          content: "Прашање " counter(pregunta);
          margin-top: 0;
      }
      
      [data-valor='true']::after {
          content: "Точно";
      }
      
      [data-valor='false']::after {
          content: "Неточно";
      }
      
      .different-language {
          font-style: italic;
      }
      
      img {
          max-height: 512px;
          max-width: 512px;
          margin-right: 10px;
          font-size: small;
          vertical-align: text-top;
          width: 50px;
          height: 50px;
          object-fit: none;
          border: 1px solid lightgray;
      }
    `;
    shadow.appendChild(style);
  }

  connectedCallback() {

    const theme = this.getAttribute('data-tema')
    const filtered = (theme.charAt(0).toLowerCase().toUpperCase() + theme.toLowerCase().slice(1)).replace(/^\s\s*/, '').replace(/\s\s*$/, '');

    const newForm = addFormPregunta();
    const questionnaireTitle = document.createElement('h2');
    questionnaireTitle.textContent = 'Квиз за ' + filtered;

    //modifying the the name attribute of the copy of the form
    newForm.querySelectorAll('ul > li').forEach(el => [...el.querySelectorAll('[name]')].map(el => {
      return el.name = el.name.replace('', `${filtered}`)
    }));

    // const restoreButton = document.createElement('input');
    // restoreButton.setAttribute('type', 'button');
    // restoreButton.setAttribute('value', 'restore');
    // restoreButton.addEventListener('click', (e) => {
    //   restoreQuestions(e, shadow)
    // })

    this.shadowRoot.prepend(newForm);
    this.shadowRoot.prepend(questionnaireTitle);
    // this.shadowRoot.appendChild(restoreButton);

    const pregunta = this.shadowRoot.children[1];
    // pregunta.addEventListener('keypress', nuevoQuestion);
    const button =  [...pregunta.children][0].children[2].children[0];
    listAllQuestions(this.id, button)
    button.addEventListener('click', (e) => {
      nuevoQuestion(e, this.id, e.target)
    });
  
    //ADD FLICKR
    const env = {
      FLICKR_API_KEY: "3b0ac2a040f697984327e5f3644ac3f8",
      FLICKR_API_SECRET: "ff176a3edb8508a2"
    };
  
    const getPictureId = new Promise((res) => {

      const pictureId = [];

      fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${env.FLICKR_API_KEY}&tags=${filtered}&format=json&nojsoncallback=1`)
        .then((response) => {
          return response.json();
        }).then((data) => {
          return pictureId.push(data.photos.photo[0].id)
        }).catch(() => {
          return pictureId.push('no')
        })

      setTimeout(() => res(pictureId), 3000)
    });

    getPictureId.then(id => {

      const flickrPromise = new Promise((res) => {

        const pictureLink = [];

        if (id[0] === 'no') {
          pictureLink.push('https://eoimages-gsfc-nasa-gov.translate.goog/images/imagerecords/57000/57723/globe_east_540.jpg?_x_tr_sl=es&_x_tr_tl=en&_x_tr_hl=es');
        } else {
          fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${env.FLICKR_API_KEY}&photo_id=${id[0]}&format=json&nojsoncallback=1`)
            .then((response) => {
              return response.json();
            }).then((data) => {
              data
                ?
                pictureLink.push(data.sizes.size[0].source) :
                pictureLink.push('https://eoimages-gsfc-nasa-gov.translate.goog/images/imagerecords/57000/57723/globe_east_540.jpg?_x_tr_sl=es&_x_tr_tl=en&_x_tr_hl=es');
            }).catch((err) => {
              console.warn('Something went wrong.', err);
            })
        }
        setTimeout(() => res(pictureLink), 3000);
      });
      flickrPromise.then((res) => {
        const url = res;
        const questionnaireImage = document.createElement('img');
        questionnaireImage.setAttribute('src', url[0]);
        questionnaireImage.setAttribute('alt', theme);
        this.shadowRoot.children[0].prepend(questionnaireImage)
      })
    });

    //ADD WIKIPEDIA
    const wikiPromise = new Promise((res) => {

      const wiki = document.createElement('div');
      wiki.className = 'wiki';
      wiki.style.fontSize = '90%';

      fetch(`https://mk.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&continue&titles=${filtered}`)
        .then((response) => {
          return response.json();
        }).then((data) => {
          if (data.query.pages[Object.keys(data.query.pages)[0]].extract) {
          wiki.innerHTML = data.query.pages[Object.keys(data.query.pages)[0]].extract.split(' [')[0].replace(/ *\[[^\]]*]/g, '').replace(/ *\&[^\]]*&/gi, ' ');
            return wiki;
          }
        }).catch((err) => {
          console.warn('Something went wrong.', err);
        });
      setTimeout(() => res(wiki), 100)
    });
    wikiPromise.then((res) => this.shadowRoot.insertBefore(res, this.shadowRoot.firstChild.nextSibling))
  }

  disconnectedCallback() {
      console.log('questionnaire removed')
  }
  
}

customElements.define('encabezado-cuestionario', Cuestionario);
