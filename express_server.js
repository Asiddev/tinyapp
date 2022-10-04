const express = require("express");
const cookieParser = require("cookie-parser");
const { request } = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return users[user];
    }
  }
  return null;
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
  res.redirect("/login");
});
app.get("/urls", (req, res) => {
  let userId = req.cookies["user_id"];

  // let user = users[userId];
  // console.log(user)

  // console.log("testing testing", users[userId]);
  const templateInfo = { urls: urlDatabase, users, userId };
  res.render("urls_index", templateInfo);
});
app.get("/urls/new", (req, res) => {
  let userId = req.cookies["user_id"];
  if (userId) {
    const templateInfo = { users, userId };
    res.render("urls_new", templateInfo);
  } else {
    res.send(`<h1>Sorry you need to be logged in to use this feature</h1>`);
  }
});

app.post("/urls", (req, res) => {
  let userId = req.cookies["user_id"];

  if (!userId) {
    res.redirect("/login");
  }

  let randomString = generateRandomString();

  console.log(req.body); // Log the POST request body to the console
  urlDatabase[randomString] = "https://" + req.body.longURL;
  res.statusCode = 300;
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/:id", (req, res) => {
  let { id } = req.params;
  let userId = req.cookies["user_id"];
  let templateInfo = {
    id: id,
    longURL: urlDatabase[id],
    users,
    userId,
  };
  res.render("urls_show", templateInfo);
});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
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
  let id = req.params.id;
  if (!urlDatabase[id]) {
    res.send(`<h1>No shortned URL with that Id</h1>`);
  }

  if (urlDatabase[id]) {
    res.statusCode = 300;
    res.redirect(`${urlDatabase[req.params.id]}`);
  } else {
    res.status(404);
    res.send("404 page not found");
  }
});

app.get("/login", (req, res) => {
  let userId = req.cookies["user_id"];
  if (userId) {
    res.redirect("/urls/");
  }

  let templateInfo = {
    users,
    userId,
  };

  res.render("login_index", templateInfo);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;
  //do we have a user with that email?
  let user = getUserByEmail(email, users);

  //yes
  if (user) {
    //Is his password the same?
    if (user.password === password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls/");
    } else {
      res.statusCode = 403;
      res.end("wrong password");
    }
    //no
  } else {
    res.statusCode = 403;
    res.end("No user with that email");
  }
});

app.post("/logout", (req, res) => {
  //clearCookie but would be better if we can delete the entire cookie not just value
  res.clearCookie("user_id");
  res.redirect("/login/");
});

app.get("/register", (req, res) => {
  let userId = req.cookies["user_id"];
  if (userId) {
    res.redirect("/urls/");
  }
  let templateInfo = {
    users,
    userId,
  };
  res.render("register_index", templateInfo);
});

app.post("/register", (req, res) => {
  let userId = req.cookies["user_id"];

  //check password and email exist
  if (req.body.email && req.body.password) {
    console.log("okay email and password exist");

    // for (let user in users) {
    //   if (users[user]["email"] === req.body.email) {
    //     res.statusCode = 400;
    //     res.end("email already in use");
    //   }
    // }

    //check if user with email exists
    if (getUserByEmail(req.body.email, users)) {
      res.statusCode = 400;
      res.end("Email already in use");
    }
    //generate new user
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    res.cookie("user_id", id);
    users[id] = {
      id,
      email,
      password,
    };
    res.redirect("/urls/");
  } else {
    res.statusCode = 400;
    res.end("Please enter a valid email and password");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
