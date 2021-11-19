'use strict';

/////////////////////////////////////////////////
// BANKIST APP

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.balance__date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////
// THE CODE
let currentAccount, timer;

// ### Logout timer
const startLogOutTimer = () => {
  let time = 60 * 5;
  const tick = () => {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;

      containerApp.style.opacity = 0;
    }
    time--;
  };
  tick();
  timer = setInterval(tick, 1000);
  return timer;
};

// ### Formate Number
const formatNumber = nr => {
  return new Intl.NumberFormat(currentAccount.locale, {
    style: 'currency',
    currency: currentAccount.currency,
  }).format(nr.toFixed(2));
};

// ### Get the Date
const formatDate = (date = false) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const theDate = date === false ? new Date() : new Date(date);
  const daysPassed = calcDaysPassed(new Date(), theDate); //nr of days

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  const locale = currentAccount.locale;
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
    // weekday: 'long',
  };
  return new Intl.DateTimeFormat(locale, options).format(theDate);
};

// #### Display transactions
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((movement, i) => {
    const movementType = movement >= 0 ? 'deposit' : 'withdrawal';
    const displayDate = formatDate(acc.movementsDates[i]);

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${movementType}">${
      i + 1
    } ${movementType}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatNumber(movement)}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
// displayMovements(account1.movements);

// #### Balance;
const accountBalance = acc => {
  acc.balance = acc.movements.reduce((balance, trans) => balance + trans, 0);
  labelBalance.textContent = `${formatNumber(acc.balance)}`;
};
// accountBalance(account1.movements);

// #### Sumarry IN - OUT - INTERESTS
const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(tr => tr > 0)
    .reduce((acc, tr) => acc + tr, 0);
  labelSumIn.textContent = formatNumber(incomes);

  const outcome = account.movements
    .filter(tr => tr < 0)
    .reduce((acc, tr) => acc + tr, 0);
  labelSumOut.textContent = formatNumber(Math.abs(outcome));

  const interest = account.movements
    .filter(tr => tr > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatNumber(interest);
};
// calcDisplaySummary(account1.movements);

// #### Create userNames
const createUsernames = accs => {
  accs.forEach(acc => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ') // Names separated in array
      .map(name => name[0]) // First letter of each name
      .join(''); // Array to string
  });
};
createUsernames(accounts);

// #### Uptade UI
const updateUI = acc => {
  displayMovements(acc);
  accountBalance(acc);
  calcDisplaySummary(acc);
};

// #### Login
btnLogin.addEventListener('click', e => {
  e.preventDefault(); //it need because forum button refresh the page
  currentAccount = accounts.find(
    acc => inputLoginUsername.value === acc.userName
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    labelDate.textContent = formatDate();

    containerApp.style.opacity = 1;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);

    timer && clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// #### Transfer money
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const transferTo = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    transferTo &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    transferTo.userName !== currentAccount.userName
  ) {
    currentAccount.movementsDates.push(new Date().toISOString());
    transferTo.movementsDates.push(new Date().toISOString());
    currentAccount.movements.push(-amount);
    transferTo.movements.push(amount);

    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// #### Loan
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      inputLoanAmount.value = '';

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
});

// #### Delete account
btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === inputCloseUsername.value
    );
    index && accounts.splice(index, 1);

    inputCloseUsername.value = inputClosePin.value = '';
    containerApp.style.opacity = 0;
  }
});

// #### Sort transaction
let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

