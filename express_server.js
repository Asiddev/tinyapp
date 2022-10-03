const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  let alphabet = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  let string = "";
  for (let i = 0; i < 6; i++) {
    let random = Math.floor(Math.random() * 26);
    string += alphabet[random];
  }
  return string;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateInfo = { urls: urlDatabase };
  res.render("urls_index", templateInfo);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();

  console.log(req.body); // Log the POST request body to the console
  urlDatabase[randomString] = "https://" + req.body.longURL;
  res.statusCode = 300;
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/:id", (req, res) => {
  let { id } = req.params;
  let templateInfo = {
    id: id,
    longURL: urlDatabase[id],
  };
  res.render("urls_show", templateInfo);
});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  // console.log(id);
  delete urlDatabase[id];
  // console.log(urlDatabase);
  res.redirect("/urls/");
});
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const newData = req.body.new_data;
  if (id) {
    urlDatabase[id] = "http://" + newData;
    res.redirect("/urls/");
  } else {
    res.statusCode = 404;
    res.send("Id not found");
  }
});
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.statusCode = 300;
    res.redirect(`${urlDatabase[req.params.id]}`);
  } else {
    res.status(404);
    res.send("404 page not found");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
