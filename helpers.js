const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return users[user].id;
    }
  }
  return undefined;
};
const urlsForUser = (id, urlDatabase) => {
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

// const urlsForUser = (id, urlDatabase) => {
//   let userUrls = {};
//   for (let url in urlDatabase) {
//     if (urlDatabase[url].userID === id) {
//       userUrls[url] = urlDatabase[url].longURL;
//     }
//   }
//   return userUrls;
// };

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};
