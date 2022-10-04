const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: [
      /* secret keys */
      "secret",
    ],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const users = {};

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url].longURL;
    }
  }
  return userUrls;
};

// eslint-disable-next-line func-style
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
  res.redirect("/register");
});

app.get("/urls", (req, res) => {
  let userId = req.session.user_id;

  console.log(userId);

  if (!userId) {
    res.send(`<h1> You must go register or login before going here</h1>`);
  }
  let userUrls = {};
  console.log(userUrls);

  const templateInfo = { urls: urlsForUser(userId), users, userId };
  res.render("urls_index", templateInfo);
});

app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;

  if (userId) {
    const templateInfo = { users, userId };
    res.render("urls_new", templateInfo);
  } else {
    res.send(`<h1>Sorry you need to be logged in to use this feature</h1>`);
  }
});

app.post("/urls", (req, res) => {
  let userId = req.session.user_id;

  if (!userId) {
    res.redirect("/login");
  }

  let id = generateRandomString();

  console.log(req.body); // Log the POST request body to the console
  urlDatabase[id] = {
    longURL: "https://" + req.body.longURL,
    userID: userId,
  };
  res.statusCode = 300;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  let { id } = req.params;
  let userId = req.session.user_id;

  if (!userId) {
    res.send(`<h1>Please log in first</h1>`);
  }
  if (urlDatabase[id].userID !== userId) {
    res.send(`<h1>You do not own a url with this id</h1>`);
  }

  let templateInfo = {
    id: id,
    longURL: urlDatabase[id].longURL,
    users,
    userId,
  };
  res.render("urls_show", templateInfo);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  let userId = req.session.user_id;

  if (urlDatabase[id].userID !== userId) {
    res.send("You can only delete you own urls");
  }
  delete urlDatabase[id];
  res.redirect("/urls/");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const newData = req.body.new_data;
  let userId = req.session.user_id;

  if (urlDatabase[id].userID !== userId) {
    res.send("You can only edit you own urls");
  }
  if (id) {
    urlDatabase[id]["longURL"] = "http://" + newData;
    res.redirect("/urls/");
  } else {
    res.statusCode = 404;
    res.send("Id not found");
  }
});

app.get("/u/:id", (req, res) => {
  let userId = req.session.user_id;

  if (!userId) {
    res.send(`<h1>Please log in</h1>`);
  }
  let id = req.params.id;
  if (urlDatabase[id].userID !== userId) {
    res.send(`<h1>No shortned URL with that Id</h1>`);
  }

  if (urlDatabase[id]) {
    res.statusCode = 300;
    res.redirect(`${urlDatabase[id].longURL}`);
  } else {
    res.status(404);
    res.send("404 page not found");
  }
});

app.get("/login", (req, res) => {
  let userId = req.session.user_id;

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
    if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      // res.cookie("user_id", user.id);
      // eslint-disable-next-line camelcase
      req.session.user_id = user.id;
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
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login/");
});

app.get("/register", (req, res) => {
  let userId = req.session.user_id;

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
  let userId = req.session.user_id;

  //check password and email exist
  if (req.body.email && req.body.password) {
    console.log("okay email and password exist");

    //check if user with email exists
    if (getUserByEmail(req.body.email, users)) {
      res.statusCode = 400;
      res.end("Email already in use");
    }
    //generate new user
    let id = generateRandomString();
    let email = req.body.email;
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    // res.cookie("user_id", id);
    // eslint-disable-next-line camelcase
    req.session.user_id = id;
    users[id] = {
      id,
      email,
      hashedPassword,
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
