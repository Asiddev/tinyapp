const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const morgan = require("morgan");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//Middlewares
app.use(morgan("dev"));
app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["secret"], //not sure if this is correct?
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
const users = {};
let visitors = [];
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

// eslint-disable-next-line func-style

//get homepage to go straight to login
app.get("/", (req, res) => {
  res.redirect("/login");
});

//get urls for specific user
app.get("/urls", (req, res) => {
  let userId = req.session.user_id;

  // console.log(userId);

  if (!userId) {
    return res
      .status(401)
      .send(`<h1> You must go register or login before going here</h1>`);
  }
  let userUrls = {};
  // console.log(userUrls);

  const templateInfo = {
    urls: urlsForUser(userId, urlDatabase),
    users,
    userId,
    urlDatabase,
  };
  res.render("urls_index", templateInfo);
});

//create new url
app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;

  if (userId) {
    const templateInfo = { users, userId };
    res.render("urls_new", templateInfo);
  } else {
    // res.send(`<h1>Sorry you need to be logged in to use this feature</h1>`);
    return res.redirect("/login");
  }
});

//post create new url
app.post("/urls", (req, res) => {
  let userId = req.session.user_id;

  if (!userId) {
    res.redirect("/login");
  }

  let id = generateRandomString();

  // console.log(req.body); // Log the POST request body to the console
  urlDatabase[id] = {
    longURL: "https://" + req.body.longURL,
    userID: userId,
    count: 0,
    date: new Date().toLocaleString(),
  };
  return res.status(300).redirect(`/urls/${id}`);
});

//get specfic url by id
app.get("/urls/:id", (req, res) => {
  let { id } = req.params;
  let userId = req.session.user_id;

  if (!userId) {
    return res.status(401).send(`<h1>Please log in first</h1>`);
  }
  if (urlDatabase[id].userID !== userId) {
    return res.status(401).send(`<h1>You do not own a url with this id</h1>`);
  }
  // console.log(visitors);
  let templateInfo = {
    id: id,
    longURL: urlDatabase[id].longURL,
    users,
    userId,
    visitors,
    urlDatabaseCount: urlDatabase[id].count,
    // timeStampVisitors,
  };
  res.status(200).render("urls_show", templateInfo);
});

//delete specfic url from users url list
app.delete("/urls/:id/delete", (req, res) => {
  //if breaks.. was a post and form was ..... action="/urls/<%= id %>/delete"
  const id = req.params.id;
  let userId = req.session.user_id;

  if (urlDatabase[id].userID !== userId) {
    res.status(400).send("You can only delete you own urls");
  }
  delete urlDatabase[id];
  res.status(200).redirect("/urls/");
});

//update specfic url from users url list
app.put("/urls/:id/update", (req, res) => {
  //if breaks... was a post and a form was action="/urls/<%= id %>/update"
  const id = req.params.id;
  const newData = req.body.new_data;
  let userId = req.session.user_id;

  if (urlDatabase[id].userID !== userId) {
    return res.satus(401).send("You can only edit you own urls");
  }
  if (id) {
    //stretch
    urlDatabase[id]["longURL"] = "http://" + newData;
    urlDatabase[id]["count"] = 0;
    urlDatabase[id]["date"] = new Date().toLocaleString();
    visitors = [];

    return res.status(300).redirect("/urls/");
  } else {
    return res.status(404).send("Id not found");
  }
});

//go to a specfic longURL from id of url
app.get("/u/:id", (req, res) => {
  let userId = req.session.user_id;
  let id = req.params.id;

  if (!userId) {
    res.status(401).send(`<h1>Please log in</h1>`);
  }

  if (urlDatabase[id].userID !== userId) {
    let otherUser = userId;

    if (!visitors.includes(otherUser)) {
      visitors.push(otherUser);
    }
  }

  if (urlDatabase[id]) {
    urlDatabase[id].count++;
  } else {
    res.status(404);
    res.send("404 page not found");
  }
  res.status(300).redirect(`${urlDatabase[id].longURL}`);
});

//getting login form html
app.get("/login", (req, res) => {
  let userId = req.session.user_id;

  if (userId) {
    return res.redirect("/urls/");
  }

  let templateInfo = {
    users,
    userId,
  };

  res.render("login_index", templateInfo);
});

//sending information to check for user
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  //do we have a user with that email?
  let user = getUserByEmail(email, users);
  let currentUser = users[user];

  //yes
  if (user) {
    //Is his password the same?
    if (bcrypt.compareSync(password, currentUser.hashedPassword)) {
      // eslint-disable-next-line camelcase
      req.session.user_id = currentUser.id;
      return res.status(300).redirect("/urls/");
    } else {
      return res.status(403).send(`<h1>Wrong Password</h1>`);
    }
    //no
  } else {
    return res.status(403).send(`<h1>No user with that email</h1>`);
  }
});

//delete cookie so we dont know next use
app.post("/logout", (req, res) => {
  req.session = null;
  res.status(300).redirect("/login/");
});

//register form html
app.get("/register", (req, res) => {
  let userId = req.session.user_id;

  if (userId) {
    res.status(300).redirect("/urls/");
  }
  let templateInfo = {
    users,
    userId,
  };
  res.status(200).render("register_index", templateInfo);
});

//getting user info from register form
app.post("/register", (req, res) => {
  let userId = req.session.user_id;

  //check password and email exist
  if (req.body.email && req.body.password) {
    //check if user with email exists
    if (getUserByEmail(req.body.email, users)) {
      return res.status(400).send(`<h1>Email already in use</h1>`);
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
  } else {
    return res
      .status(400)
      .send(`<h1>Please enter valid email and password for registration</h1>`);
  }
  return res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
