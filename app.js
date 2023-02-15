'use strict';

const express = require('express');
const {
  v4: uuidv4
} = require('uuid');
const app = express();

const config = require('./config.js');

var knex = null;

// inicializa Knex.js para usar diferentes bases de datos según el entorno:
function conectaBD() {
  if (knex === null) {
    var options;
    if (process.env.QUIZAPP === 'gae') {
      options = config.gae;
      console.log('Usando Cloud SQL (MySQL) como base de datos en Google App Engine');
    } else if (process.env.QUIZAPP === 'heroku') {
      options = config.heroku;
      console.log('Usando PostgreSQL como base de datos en Heroku');
    } else {
      options = config.localbd;
      console.log('Usando SQLite como base de datos local');
    }
    // Muestra la conversión a SQL de cada consulta:
    // options.debug= true;
    knex = require('knex')(options);
  }
}

// crea las tablas si no existen:
async function creaEsquema(res) {
  try {
    let existeTabla = await knex.schema.hasTable('questionnaires');
    if (!existeTabla) {
      await knex.schema.createTable('questionnaires', (tabla) => {
        tabla.increments('id').primary();
        tabla.string('questionnaireId', 100).notNullable();
        tabla.string('name', 100).notNullable();
      });
      console.log("Se ha creado la tabla questionnaires");
    }
    existeTabla = await knex.schema.hasTable('items');
    if (!existeTabla) {
      await knex.schema.createTable('items', (table) => {
        table.increments('itemId').primary();
        table.string('questionnaire', 100).notNullable();
        table.string('question', 100).notNullable();
        table.string('answer').notNullable();
      });
      console.log("Se ha creado la tabla items");
    }
  } catch (error) {
    console.log(`Error al crear las tablas: ${error}`);
    res.status(404).send({
      result: null,
      error: 'error al crear la tabla; contacta con el administrador'
    });
  }
}


async function numeroQuestionnaires() {
  let n= await knex('questionnaires').countDistinct('questionnaireId as n');
  // the value returned by count in this case is an array of objects like [ { n: 2 } ]
  return n[0]['n'];
}

async function numeroQuestions(questionnaire) {
  let r= await knex('items').select('question')
                                .where('questionnaire',questionnaire);
  return r.length;
}

async function existeQuestionnaire(questionnaire) {
  let r= await knex('questionnaires').select('questionnaireId')
                               .where('questionnaireId',questionnaire);
  return r.length>0;
}

async function existeQuestion(question,questionnaire) {
  let r= await knex('items').select('question')
                                .where('question',question)
                                .andWhere('questionnaire',questionnaire);
  return r.length>0;
}


// asume que el cuerpo del mensaje de la petición está en JSON:
app.use(express.json());

// middleware para aceptar caracteres UTF-8 en la URL:
app.use((req, res, next) => {
  req.url = decodeURI(req.url);
  next();
});

// middleware para las cabeceras de CORS:
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
  res.header("Access-Control-Allow-Headers", "content-type");
  next();
});


// middleware que establece la conexión con la base de datos y crea las 
// tablas si no existen; en una aplicación más compleja se crearía el
// esquema fuera del código del servidor:
app.use(async (req, res, next) => {
  app.locals.knex = conectaBD(app.locals.knex);
  await creaEsquema(res);
  next();
});


// crea un questionnaire:
app.post(config.app.base + '/', async (req, res) => {
  if (!req.body.name) {
    res.status(404).send({ result:null,error:'datos mal formados' });
    return;
  }
  try {
    let n = await numeroQuestionnaires();
    if (n >= config.app.maxQuestionnaires) {
      res.status(404).send({
        result: null,
        error: 'No caben más questionnaires; contacta con el administrador'
      });
      return;
    }
    let existe = true;
    while (existe) {
      var id = uuidv4();
      existe = await existeQuestionnaire(id);
    }
    var c = {
      questionnaireId: id,
      name: req.body.name
    };
    await knex('questionnaires').insert(c);
    res.status(200).send({
      result: {
        questionnaireId: id,
        name: req.body.name
      },
      error: null
    });
  } catch (error) {
    console.log(`No se puede crear el questionnaire: ${error}`);
    res.status(404).send({
      result: null,
      error: 'no se pudo crear el questionnaire'
    });
  }
});


// crea un nuevo question:

app.post(config.app.base+'/:questionnaire', async (req, res) => {
  if (!req.body.question || !req.body.answer) {
    res.status(404).send({ result:null,error:'datos mal formados' });
    return;
  }
  try {
    let existe= await existeQuestionnaire(req.params.questionnaire);
    if (!existe) {
      res.status(404).send({ result:null,error:`questionnaire ${req.params.questionnaire} no existente` });
      return;  
    }
    existe= await existeQuestion(req.body.question,req.params.questionnaire);
    if (existe) {
      res.status(404).send({ result:null,error:`question ${req.body.question} ya existente` });
      return;
    }
    let n= await numeroQuestions(req.params.questionnaire);
    if (n>=config.app.maxItems) {
      res.status(404).send({ result:null,error:`No caben más Items en el questionnaire ${req.params.questionnaire}` });
      return;
    }
    var i= { questionnaire:req.params.questionnaire,question:req.body.question,answer:req.body.answer };
    await knex('items').insert(i);
    res.status(200).send({ result:'ok',error:null });
  } catch (error) {
    console.log(`No se puede añadir el question: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo añadir el question' });
  }
});


// lista los questionnaires:
app.get(config.app.base + '/', async (req, res) => {
  try {
    let i = await knex('questionnaires')
    res.status(200).send({
      result: i,
      error: null
    });
  } catch (error) {
    console.log(`No se puede obtener questionnaires: ${error}`);
    res.status(404).send({
      result: null,
      error: 'no se pudo obtener questionnaires'
    });
  }
});

// lista los questions de un questionnaire:
//TUKA
app.get(config.app.base + '/:questionnaire', async (req, res) => {
  try {
    let existe = await existeQuestionnaire(req.params.questionnaire);
    if (!existe) {
      res.status(404).send({
        result: null,
        error: `questionnaire ${req.params.questionnaire} no existente`
      });
      return;
    }
    let i = await knex('items').select(['question', 'answer'])
      .where('questionnaire', req.params.questionnaire);
    res.status(200).send({
      result: i,
      error: null
    });
  } catch (error) {
    console.log(`No se puede obtener los items del questionnaire: ${error}`);
    res.status(404).send({
      result: null,
      error: 'no se pudo obtener los datos del questionnaire'
    });
  }
});


// lista los datos de un question:
app.get(config.app.base + '/:questionnaire/:question', async (req, res) => {
  try {
    let existe = await existeQuestionnaire(req.params.questionnaire);
    if (!existe) {
      res.status(404).send({
        result: null,
        error: `questionnaire ${req.params.questionnaire} no existente`
      });
      return;
    }
    existe = await existeQuestion(req.params.question, req.params.questionnaire);
    if (!existe) {
      res.status(404).send({
        result: null,
        error: `question ${req.params.question} no existente`
      });
      return;
    }
    let i = await knex('items').select(['question', 'answer'])
      .where('questionnaire', req.params.questionnaire)
      .andWhere('question', req.params.question);
    res.status(200).send({
      result: i[0],
      error: null
    });
  } catch (error) {
    console.log(`No se pudo obtener el question: ${error}`);
    res.status(404).send({
      result: null,
      error: 'no se pudo obtener el question'
    });
  }
});


// borra un question:
app.delete(config.app.base + '/:questionnaire/:question', async (req, res) => {
  try {
    let existe = await existeQuestionnaire(req.params.questionnaire);
    if (!existe) {
      res.status(404).send({
        result: null,
        error: `questionnaire ${req.params.questionnaire} no existente`
      });
      return;
    }
    existe = await existeQuestion(req.params.question, req.params.questionnaire);
    if (!existe) {
      res.status(404).send({
        result: null,
        error: `question ${req.paramsº.question} no existente`
      });
      return;
    }
    await knex('items').where('questionnaire', req.params.questionnaire).andWhere('question', req.params.question).del();
    res.status(200).send({
      result: 'ok',
      error: null
    });
  } catch (error) {
    console.log(`No se pudo obtener el question: ${error}`);
    res.status(404).send({
      result: null,
      error: 'no se pudo obtener el question'
    });
  }
});


// borra un questionnaire:
app.delete(config.app.base + '/:questionnaire', async (req, res) => {
  try {
    let existe = await existeQuestionnaire(req.params.questionnaire);
    if (!existe) {
      res.status(404).send({
        result: null,
        error: `questionnaire ${req.params.questionnaire} no existente`
      });
      return;
    }
    await knex('items').where('questionnaire', req.params.questionnaire)
      .del();
    await knex('questionnaires').where('questionnaireId', req.params.questionnaire)
      .del();
    res.status(200).send({
      result: 'ok',
      error: null
    });
  } catch (error) {
    console.log(`No se pudo encontrar el questionnaire: ${error}`);
    res.status(404).send({
      result: null,
      error: 'no se pudo encontrar el questionnaire'
    });
  }
});


const secret = '12345';

// borra toda la base de datos:
app.get(config.app.base + '/clear', async (req, res) => {
  try {
    await knex('items').where('questionnaire', req.params.questionnaire)
      .del();
    await knex('questionnaires').where('questionnaireId', req.params.questionnaire)
      .del();
    res.status(200).send({
      result: 'ok',
      error: null
    });
  } catch (error) {
    console.log(`No se pudo borrar la base de datos: ${error}`);
  }
});


const path = require('path');
const publico = path.join(__dirname, 'public');
// __dirname: carpeta del proyecto

app.get(config.app.base + '/', (req, res) => {
  res.status(200).send('API web para gestionar questionnaires de la compra');
});

app.get(config.app.base + '/ayuda', (req, res) => res.sendFile(path.join(publico, 'index.html')));

app.use('/', express.static(publico));

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`Aplicación lanzada en el puerto ${ PORT }!`);
});