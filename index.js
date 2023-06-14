const express = require("express");
const app = express();
const { v4: uuidV4 } = require("uuid");
const cors = require("cors");

//! Middle wares
app.use(cors());
app.use(express.urlencoded({ extended: true }));

let persons = [
  {
    id: "1",
    name: "Sam",
    age: "26",
    hobbies: [],
  },
]; //This is your in memory database

app.set("db", persons);
//TODO: Implement crud of person

//! Person field validator
function personValidator(person) {
  if (!person) {
    return "Empty request body";
  }

  if (!person.name || person.name.trim().length === 0) {
    return "Name is requiered field";
  }

  if (!person.age || isNaN(person.age)) {
    return "Age is required and must be number";
  }

  if (!person.hobbies) {
    return "Hobbies is a required field";
  }

  if (person.hobbies && !Array.isArray(person.hobbies)) {
    return "Hobbies must be an array";
  }

  return null;
}

//! Get user
app.get("/person/:id?", (req, res) => {
  const personId = req.params.id;
  const persons = app.get("db");

  if (personId) {
    const person = persons.find((person) => person.id === personId);
    if (!person) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(person);
  }

  return res.json(persons);
});

//! Create new user
app.post("/person", (req, res) => {
  const newPerson = req.body;
  // Validating user
  const error = personValidator(newPerson);
  if (error) {
    return res.status(400).json({ error: error });
  }

  // add the new user
  const person = {
    id: uuidV4(),
    name: newPerson.name,
    age: newPerson.age,
    hobbies: newPerson.hobbies,
  };

  // Add to db
  const persons = app.get("db");
  persons.push(person);
  return res.status(200).json(person);
});

//! Update person by id
app.put("/person/:id", (req, res) => {
  const updatePerosn = req.body;
  const personId = req.params.id;
  const persons = app.get("db");

  const personIndex = persons.findIndex((person) => person.id === personId);
  if (personIndex !== -1) {
    persons[personIndex] = { ...persons[personIndex], ...updatePerosn };
    return res.status(201).json(persons[personId]);
  } else {
    return res.status(404).json("User not found.");
  }
});

//! Delete person id
app.delete("/person/:id", (req, res, next) => {
  const personId = req.params.id;
  const persons = app.get("db");

  const personIndex = persons.findIndex((person) => person.id === personId);
  if (personIndex !== -1) {
    persons.splice(personIndex, 1);
    return res.json(`Person deleted successfully`);
  } else {
    return res.status(404).json("User not found");
  }
});

//! Non existance request
app.use((req, res) => {
  return res.status(404).json({ error: "Page not found" });
});

//! Internal server error
app.use((req, res, next) => {
  return res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(3000);
}
module.exports = app;
