const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const BinaryType = require('js-binary').Type;

const app = express();
app.use(morgan('combined'));

const PEOPLE = ['Lucas', 'Herman', 'Jonathan', 'Sam', 'Alex', 'Tim'];
const binarySchema = new BinaryType({
  nextId: 'int',
  payments: [{
    id: 'int',
    type: 'boolean', // (true) payment, (false) request,
    time: 'int',
    description: 'string',
    source: 'uint',
    destinations: ['uint'],
    amount: 'int'
  }]
});

let db = null;

if (fs.existsSync('./db')) {
  db = binarySchema.decode(fs.readFileSync('./db'));
} else {
  db = {
    nextId: 1,
    payments: []
  };
  saveData();
}

function saveData(cb) {
  fs.writeFile('./db', binarySchema.encode(db), err => {
    if (err) {
      console.error(err);
      if (cb) cb(err);
    } else {
      if (cb) cb(false);
    }
  });
}

app.get('/api', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db));
});

app.get('/api/create', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');

  const type = req.query.payment;
  const time = Date.now();
  const description = req.query.description;
  const source = req.query.source;
  const destinations = (req.query.destinations || '').split(',');
  const amount = parseInt(req.query.amount);

  if (type === undefined)
    return res.status(400).send('"type" not defined!');
  if (description && description.length > 500)
    return res.status(400).send('Description is more than 500 characters!');
  if (!PEOPLE.includes(source))
    return res.status(400).send('Invalid source person.');
  
  const allPeopleValid = destinations.reduce((valid, person) => valid && PEOPLE.includes(person), true);
  if (!allPeopleValid)
    return res.status(400).send('Not all destinations are valid!');
  if (destinations.includes(source)) {
    return res.status(400).send('Destination cannot contain source!');
  }
  if (amount <= 0)
    return res.status(400).send('Invalid amount. Must be greater than 0!');
  if (amount > 1000*100)
    return res.status(400).send('Yeah, you really shouldn\'t be handling transactions of $1000+ in this program....');
  if (amount % destinations.length != 0)
    return res.status(400).send('Amount must be divisible by number of destinations');
  
  const id = db.nextId++;
  const payment = {
    id,
    type: type === 'true',
    time,
    description,
    source: PEOPLE.indexOf(source),
    destinations: destinations.map(person => PEOPLE.indexOf(person)),
    amount
  };
  db.payments.push(payment);

  saveDataFromRoute(res, payment, true);

});

app.get('/api/delete', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');

  const idToDelete = parseInt(req.query.id);
  let found = false;
  for (let i = db.payments.length - 1; i >= 0; i--) {
    if (db.payments[i].id === idToDelete) {
      found = true;
      db.payments.splice(i, 1);
      break;
    } else if (db.payments[i].id < idToDelete) {
      break;
    }
  }

  if (found) {
    saveDataFromRoute(res, 'Deleted successfully');
  } else res.status(500).send('Could not find payment to delete with id: '+idToDelete);
});

function saveDataFromRoute(res, successMessage, isJson) {
  saveData(err => {
    if (!err) {
      if (isJson) res.setHeader('Content-Type', 'application/json');
      res.send(successMessage);
    } else {
      res.status(500).send('Error: '+err);
    }
  });
}

app.use(express.static(__dirname + '/../../client/dist'));

app.listen(3000 || process.env.PORT);