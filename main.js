const checkWord = (word) => {
  const tryLetters = [
    ...document.querySelectorAll(".game .tries .try.active input"),
  ];
  const checkBtn = document.querySelector(".actions .check");
  checkBtn.disabled = true;

  const hits = [];
  const passed = tryLetters
    .map((letter, i) => {
      letter.style.color = "white";
      letter.disabled = true;

      if (letter.value === word[i]) {
        letter.style.backgroundColor = "green";
        hits.push(i);
        return true;
      } else if (word.indexOf(letter.value) >= 0)
        letter.style.backgroundColor = "orange";
      else letter.style.backgroundColor = "red";

      return false;
    })
    .reduce((prev, current) => prev && current);

  return { passed, hits };
};

const createDomAttempt = (order, wordLength) => {
  const attempt = document.createElement("div");
  attempt.className = "try";
  if (order === 0) attempt.classList.add("active");

  const span = document.createElement("span");
  span.textContent = `Try ${order + 1}`;
  const word = document.createElement("div");
  word.className = "word";
  for (let i = 0; i < wordLength; i++) {
    const input = document.createElement("input");
    input.disabled = order !== 0;
    input.maxLength = 1;

    if (i === 0 && order === 0) input.autofocus = true;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value.length) {
        e.target.previousElementSibling?.focus();
      }
    });

    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase();

      const tryLetters = [
        ...document.querySelectorAll(".game .tries .try.active input"),
      ];

      const checkBtn = document.querySelector(".actions .check");
      if (tryLetters.every((l) => l.value.length)) checkBtn.disabled = false;
      else checkBtn.disabled = true;

      if (e.target.value.length) {
        e.target.nextElementSibling?.focus();
      }
    });
    word.appendChild(input);
  }
  attempt.append(span, word);
  return attempt;
};

const showModal = (passed, word) => {
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".overlay .modal");
  const status = document.querySelector(".overlay .modal .head h2");
  const message = document.querySelector(".overlay .modal .body span");
  const newBtn = document.querySelector(".overlay .modal .actions .new");
  status.textContent = passed ? "Awesome!" : "You Lose!";
  status.style.color = passed ? "green" : "red";
  message.textContent = word;
  overlay.classList.remove("hide");
  modal.classList.add("popup");
  setTimeout(() => {
    modal.classList.remove("popup");
  }, 1000);

  newBtn.textContent = passed ? "New game" : "Try again";
  if (passed) newBtn.classList.remove("lose");
  else newBtn.classList.add("lose");
};

const getNextTry = () => {
  const currentTry = document.querySelector(".game .tries .try.active");
  const nextTry = currentTry?.nextElementSibling;

  currentTry?.classList.remove("active");
  if (nextTry) {
    nextTry.classList.add("active");
    [...nextTry.children[1].children].forEach((letter, i) => {
      letter.disabled = false;
      if (i === 0) letter.focus();
    });
  }
  return nextTry;
};

const handleHinting = (hits, word) => {
  const tryLetters = [
    ...document.querySelectorAll(".game .tries .try.active input"),
  ];

  for (let i = 0; i < tryLetters.length; i++) {
    if (!hits.includes(i)) {
      hits.push(i);
      tryLetters[i + 1]?.focus();
      tryLetters[i].disabled = true;
      tryLetters[i].value = word[i];
      tryLetters[i].style.color = "white";
      tryLetters[i].style.backgroundColor = "green";
      break;
    }
  }

  const passed = tryLetters.every(
    (letter) => letter.style.backgroundColor === "green"
  );

  if (passed) showModal(true, word);

  return hits;
};

const handleAnswer = (e, word) => {
  e.preventDefault();
  const { passed, hits } = checkWord(word);

  const hintsBtn = document.querySelector(".actions .hint");

  if (passed) {
    hintsBtn.disabled = true;
    showModal(true, word);
  } else if (!getNextTry()) {
    hintsBtn.disabled = true;
    showModal(false, word);
  }
  return hits;
};

const renderAttempts = (word) => {
  const attempts = 5;

  const tries = document.querySelector(".game .tries");
  tries.innerHTML = "";
  for (let i = 0; i < attempts; i++)
    tries.appendChild(createDomAttempt(i, word.length));
};

window.onload = () => {
  let word = sample[Math.floor(Math.random() * sample.length)].toUpperCase();
  let hints = 3;
  let hits = [];

  renderAttempts(word);

  const hintsBtn = document.querySelector(".actions .hint");
  hintsBtn.firstElementChild.textContent = hints;

  const newBtns = document.querySelectorAll(".actions .new");
  newBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      word = sample[Math.floor(Math.random() * sample.length)].toUpperCase();
      hints = 3;
      hits = [];

      renderAttempts(word);

      hintsBtn.firstElementChild.textContent = hints;
      hintsBtn.disabled = false;
    })
  );

  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".overlay .modal");
  const closeBtns = document.querySelectorAll(".overlay .modal button");

  overlay.addEventListener("click", () => {
    modal.classList.add("popdown");
    setTimeout(() => {
      overlay.classList.add("hide");
      modal.classList.remove("popdown");
    }, 300);
  });
  modal.addEventListener("click", (e) => e.stopPropagation());
  closeBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      modal.classList.add("popdown");
      setTimeout(() => {
        overlay.classList.add("hide");
        modal.classList.remove("popdown");
      }, 300);
    })
  );

  const form = document.querySelector(".game");
  form.addEventListener(
    "submit",
    (e) => (hits = [...new Set([...hits, ...handleAnswer(e, word)])])
  );

  hintsBtn.addEventListener("click", () => {
    if (hints > 0) {
      hintsBtn.firstElementChild.textContent = --hints;

      if (hits.length === word.length - 1 || hints === 0)
        hintsBtn.disabled = true;
      hits = handleHinting(hits, word);
    }
  });
};
