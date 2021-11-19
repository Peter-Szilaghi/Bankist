'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// // Data ARRAY
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];
// // Data Number, Dates, Intl, Timers
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

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES ARRAY

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// //NOTE #1 Methods
// let arr = ['a', 'b', 'c', 'd', 'e'];

// // #1 SLICE .slice() //NOT mutate the original arr
// // First index(include), Last index(not include)
// console.log(arr.slice(2));
// console.log(arr.slice(2, 4));
// console.log(arr.slice(2, 4));
// console.log(arr.slice(-2));
// console.log(arr.slice(-1));
// console.log(arr.slice(1, -2));

// //these are the same results, create a shadow copy (not mutate de original array)
// console.log(arr.slice()); //on this you can use anothers metods directle, ex: .slice().indexOf()
// console.log([...arr]);

// // #2 SPLICE .splice() //MUTATE the orirignal array(the rest of elements)
// // First index(include), num of elements
// console.log(arr.slice(2)); // ['c', 'd', 'e']
// console.log(arr); // ['a' , 'b']

// // Pop vs Splice
// arr.pop(); //retunr 'e'; remove e from arr //.pop() is faster
// arr.splice(1, 2); //return ['e']; remove e from arr

// // #3 RESERVE .reverse() //MUTATE the original array
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse());
// console.log(arr);

// // #4 CONCAT .concat() //NOT mutate the original array
// const letters = arr.concat(arr2);
// console.log(letters);
// //these are the same results, create a shadow copy (not mutate de original array)
// console.log(arr.concat(arr2)); //on this you can use anothers metods directle, ex: .slice().indexOf()
// console.log([...arr, ...arr2]);

// // #5 JOIN .join() //NOT mutate the original array
// console.log(letters.join(' - '));

/////////////////////////////////////////////////
//NOTE #2 forEach()
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const [i, movement] of movements.entries()) {
//   movement > 0
//     ? console.log(`Movement ${i + 1}: You deposited ${movement}`)
//     : console.log(`Movement ${i + 1}: You withdraw ${movement}`);
//   // console.log(
//   //   `Movement ${i + 1}: ${
//   //     movement > 0 ? 'You deposited' : 'You withdraw'
//   //   } ${movement}`
//   // );
// }

// movements.forEach((movement, i) => {
//   movement > 0
//     ? console.log(`Movement ${i + 1}: You deposited ${movement}`)
//     : console.log(`Movement ${i + 1}: You withdraw ${movement}`);
// });
// // 0: function(200)
// // 1: function(450)
// // 2: function(-400)
// // ...

/////////////////////////////////////////////////
//NOTE #2.2 .forEach with map and set

// // Map
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach((value, key, map) => {
//   console.log(`${key}: ${value}`);
// });

// // Set
// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// currenciesUnique.forEach((value, key) => {
//   console.log(`${key}: ${value}`);
// });

////////////////
// CHALLENGE #1
// const dogsJulia1 = [3, 5, 2, 12, 7];
// const dogsKate1 = [4, 1, 15, 8, 3];

// const dogsJulia2 = [9, 16, 6, 8, 3];
// const dogsKate2 = [10, 5, 6, 1, 4];

// const checkDogs = (arr1, arr2) => {
//   const arr1Corrected = arr1.slice(1, -2);

//   // const dogs = arr1.concat(arr2);
//   const dogs = [...arr1Corrected, ...arr2];

//   dogs.forEach((dog, i) => {
//     dog >= 3
//       ? console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`)
//       : console.log(`Dog number ${i + 1} is still a puppy 🐶`);
//   });
// };

// checkDogs(dogsJulia1, dogsKate1);
// checkDogs(dogsJulia2, dogsKate2);

/////////////////////////////////////////////////
//NOTE #3 Map method
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const eurToUsd = 1.1;

// const movementsUSD = movements.map(mov => (mov * eurToUsd).toFixed());
// console.log(movements);
// console.log(movementsUSD);

// const movementsUSDfor = [];
// for (const mov of movements) movementsUSDfor.push((mov * eurToUsd).toFixed());
// console.log(movementsUSDfor);

// const movementsDescriptions = movements.map((movement, i, arr) => {
//   return `Movement ${i + 1}: You ${
//     movement > 0 ? 'deposited' : 'withdraw'
//   } ${movement}`;
// });

// console.log(movementsDescriptions);

/////////////////////////////////////////////////
//NOTE #4 Filter method
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const deposits = movements.filter(mov => mov > 0);
// console.log(movements);
// console.log(deposits);

// const depositsFor = [];
// for (const mov of movements) {
//   mov > 0 && depositsFor.push(mov);
// }
// console.log(depositsFor);

// const withdrawals = movements.filter(mov => mov < 0);
// console.log(withdrawals);

/////////////////////////////////////////////////
//NOTE #5 Reduce method
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // const balance = movements.reduce((acc, cur, i, arr) => {
// //   console.log(`Iteration ${i}: ${acc}`);
// //   return acc + cur;
// // }, 0);
// const balance = movements.reduce((acc, curr) => acc + curr, 0);

// console.log(balance);

// let balanceFor = 0;
// for (const mov of movements) balanceFor += mov;
// console.log(balanceFor);

// // Maximum value
// const max = movements.reduce(
//   (acc, curr) => (acc > curr ? acc : curr),
//   movements[0]
// );
// console.log(max);

// const max1 = movements.reduce((acc, curr) => acc);
// console.log(max1);

////////////////
// CHALLENGE #2
// const calcAverageHumanAge = ages => {
//   console.log(`Dog ages: ${ages}`);

//   const humanAges = ages.map(age => (age <= 2 ? age * 2 : 16 + age * 4));
//   console.log(`Human ages: ${humanAges}`);

//   const adults = humanAges.filter(age => age >= 18);
//   console.log(`Adult human ages: ${adults}`);

//   // const average = adults.reduce((acc, age) => acc + age, 0) / adults.length;
//   const average = adults.reduce(
//     (acc, age, i, arr) => acc + age / arr.length,
//     0
//   );
//   console.log(`Adult human average age: ${average}`);

//   console.log(' ------- ');

//   return average;
// };
// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

// console.log(avg1, avg2);

/////////////////////////////////////////////////
//NOTE #6 Map Filter Reduce methods togheter
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const eurToUsd = 1.1;
// console.log(movements);

// // PIPELINE
// const totalDepisitsUSD = movements
//   .filter(mov => mov > 0)
//   // .map((mov, i, arr) => {
//   //   console.log(arr);
//   //   return mov * eurToUsd;
//   // })
//   .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0);

// console.log(totalDepisitsUSD);

////////////////
// CHALLENGE #3
// const calcAverageHumanAge = ages => {
//   const average = ages
//     .map(age => (age <= 2 ? age * 2 : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
// };
// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

// console.log(avg1, avg2);

/////////////////////////////////////////////////
//NOTE #7 find() and findIndex() return first element/index
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal);

// console.log(accounts);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

/////////////////////////////////////////////////
//NOTE #8 some and every
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // Equality
// console.log(movements.includes(-130));

// // some: Condition
// const anyDeposits = movements.some(mov => mov > 1500);
// console.log(anyDeposits);

// // every: Condition
// const everyDeposits = movements.every(mov => mov > 1500);
// console.log(everyDeposits);

// // separate callback
// const deposit = mov => mov > 0;
// console.log(movements.some(deposit));
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

/////////////////////////////////////////////////
//NOTE #9 falt and flatMap
// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];

// const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat());
// console.log(arrDeep.flat(2));
// // console.log(arrDeep.flatMap());

// // flat
// const overalBalance = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((sum, mov) => sum + mov, 0);
// console.log(overalBalance);

// // flatMap
// const overalBalance2 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((sum, mov) => sum + mov, 0);
// console.log(overalBalance2);

/////////////////////////////////////////////////
//NOTE #10 Sorting array
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// // sort transform in string ex: '32' > '310' (2>1)

// // strings
// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort()); // MT
// console.log(owners);

// // numbers ascending
// movements.sort((a, b) => a - b);
// console.log(`Ascending: ${movements}`);

// // numbers  ascending
// movements.sort((a, b) => b - a);
// console.log(`Descending: ${movements}`);

/////////////////////////////////////////////////
//NOTE #11 Create array
// const arr = [1, 2, 3, 4, 5, 6, 7];
// console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// // Empty arrau + fill
// const x = new Array(7); //create array wit 7 empty element
// console.log(x);

// x.fill(1); //MT fill array with every elements value = 1
// // x.fill(1, 3, 5); //arr.fill(el, startIndex, EndIndex)
// console.log(x);

// arr.fill(23, 4, 6);
// console.log(arr);

// // Array.from()
// const y = Array.from({ length: 7 }, () => 1); //new Array(7)/.fill(1)
// console.log(y);

// const z = Array.from({ length: 7 }, (curr, i) => i + 1);
// // const z = Array.from({ length: 7 }, (_, i) => i + 1); //use _ if you do not use parameter
// console.log(z);

// const randomArr = Array.from({ length: 10 }, (_, i) =>
//   Number((Math.random() * 7).toFixed())
// );
// console.log(randomArr);

// //transform nodelit to real array
// const movementsUI = Array.from(document.querySelectorAll('.movements__value'));
// console.log(movementsUI);

// labelBalance.addEventListener('click', () => {
//   // const movementsUI = Array.from(
//   //   document.querySelectorAll('.movements__value')
//   // );
//   // console.log(movementsUI.map(el => Number(el.textContent.replace('€', ''))));

//   const movementsUI2 = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', ''))
//   );
//   console.log(movementsUI2);

//   // const movementsUI3 = [...document.querySelectorAll('.movements__value')];
// });

/////////////////////////////////////////////////
//NOTE #12 Exercise
// // #1
// const bankDepositSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(tr => tr > 0)
//   .reduce((sum, tr) => sum + tr, 0);
// console.log(bankDepositSum);

// // #2.1 with filter
// // const numDeposits1000 = accounts
// //   .flatMap(acc => acc.movements)
// //   .filter(tr => tr >= 1000).length;
// // console.log(numDeposits1000);

// // # 2.2 with reduce
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((count, tr) => (tr >= 1000 ? ++count : count), 0);
// console.log(numDeposits1000);

// // #3
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sum, curr) => {
//       // curr > 0 ? (sum.deposits += curr) : (sum.withdrawals += curr);
//       sum[curr > 0 ? 'deposits' : 'withdrawals'] += curr;
//       return sum;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );
// console.log(deposits, withdrawals);

// // #4
// const convertTitleCase = title => {
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);
//   const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'in', 'with'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(' ');

//   // return titleCase;
//   return capitalize(titleCase); // exception is not valid for first word (all string is 1 element)
// };
// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXAMPLE'));

////////////////
// CHALLENGE #4
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// //#1 Add Recommended portion
// dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));

// // #2 Log Sarah's Dog
// const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(
//   `${dogSarah.owners[dogSarah.owners.indexOf('Sarah')]}'s dog eat too ${
//     dogSarah.curFood > dogSarah.recFood ? 'much' : 'little'
//   }`
// );

// // #3 Store too much/low owner's dog's food
// const ownersEatTooMuch = dogs
//   .filter(dog => dog.curFood > dog.recFood)
//   .flatMap(dog => dog.owners);
// const ownersEatTooLittle = dogs
//   .filter(dog => dog.curFood < dog.recFood)
//   .flatMap(dog => dog.owners);
// console.log(ownersEatTooMuch, ' VS ', ownersEatTooLittle);

// // #4
// console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much`);
// console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too low`);

// // #5
// console.log(dogs.some(dog => dog.curFood === dog.recFood));

// // #6
// const checkEatingOkay = dog =>
//   dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;
// console.log(dogs.some(checkEatingOkay));

// // #7
// console.log(dogs.filter(checkEatingOkay));

// // #8
// const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
// console.log(dogsSorted);

/////////////////////////////////////////////////
//NOTE #13 ES2020
// const arr = [23, 11, 64];
// console.log(arr[0]);
// console.log(arr.at(0));

// console.log(arr[arr.length - 1]);
// console.log(arr.at(-1));

// console.log('string'.at(0));
// console.log('string'.at(-1));

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES Number, Dates, Intl, Timers

/////////////////////////////////////////////////
//NOTE #1 Numbers
// // a singel type for number: number
// // all numbers are binary type
// console.log(23 === 23.0); //true

// // Base 10 - 0 to 9 // 1/10 = 0.1; 3/10 = 3.333333
// // Base 2 - 0 and 1

// console.log(0.1 + 0.2); // 0.3000000000004
// console.log(0.1 + 0.2 === 0.3); //false

// // Conversion
// console.log(Number('23'));
// console.log(+'23');

// // Parsing
// console.log(Number.parseInt('30px')); //30
// console.log(Number.parseInt('e30')); //NaN

// console.log(Number.parseInt('2.5rem')); //2
// console.log(Number.parseFloat('2.5rem')); //2.5

// // Check if value is NaN
// console.log(Number.isNaN(20)); //false //20
// console.log(Number.isNaN('20')); //false //'20'
// console.log(Number.isNaN(+'20X')); //true //NaN
// console.log(Number.isNaN(23 / 0)); //false //Infinity

// // Check if value is number
// console.log(Number.isFinite(20)); //true //20
// console.log(Number.isFinite('20')); //false //'20'
// console.log(Number.isFinite(+'20X')); //false //NaN
// console.log(Number.isFinite(23 / 0)); //false //Infinity

// // Check if value is integer
// console.log(Number.isInteger(23)); //true
// console.log(Number.isInteger(23.0)); //true
// console.log(Number.isInteger(23.7)); //false

// // Sqrt
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2)); // 5^2 = 25
// console.log(8 ** (1 / 3)); // 2^3 = 8

// // Min and Max
// console.log(Math.max(5, 18, 23, 11, 2)); //23
// console.log(Math.max(5, 18, '23', 11, 2)); //23
// console.log(Math.min(5, 18, '23px', 11, 2)); //NaN

// console.log(Math.max(5, 18, 23, 11, 2)); //5
// console.log(Math.max('5', 18, 23, 11, 2)); //5
// console.log(Math.max('5px', 18, 23, 11, 2)); //NaN

// console.log(Math.PI); // PI value

// // Random Nummers
// console.log(Math.random()); //nr between 0 and 1
// console.log(Math.trunc(Math.random() * 6) + 1); //nr between 1 and 6 (included)

// const randomInt = (min, max) => {
//   Math.floor(Math.random() * (max - min + 1) + min);
// };

// // Rounding integers
// console.log(Math.trunc(23.3)); //cut any decimals, show integer
// console.log(Math.round(23.4)); //round nr up or down, .5 is 1

// console.log(Math.ceil(23.9)); //round up;
// console.log(Math.floor(23.9)); //round down;

// // Rounding decimals
// console.log((2.7).toFixed(0)); //3 //similar to round //string
// console.log((2.7).toFixed(3)); //2.700

// // Even vs Odd (par vs impar)
// const isEvenOrOdd = nr =>
//   console.log(`${nr} is ${nr % 2 === 0 ? 'even' : 'odd'}`);
// isEvenOrOdd(6);
// isEvenOrOdd(7);

// labelBalance.addEventListener('click', () => {
//   [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
//     if (i % 2 === 0) row.style.backgroundColor = 'coral';
//   });
// });

// // BigInt
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2 ** 53);
// console.log(2 ** 53 + 1);

// console.log(5469412318816794134597662564n);
// console.log(BigInt(5469412318816794134597662564));

// //Iperations with BigInt
// console.log(10000n + 100000n);
// console.log(5465468551618762154965n * 100000n);

// const huge = 5465468551618762154965n;
// const number = 23;
// // console.log(huge * number); //now worh
// console.log(huge * BigInt(number));

// console.log(20n == 20); //true
// console.log(20n === 20); //false, biint is not number

// console.log(10n / 3n); //3n
// console.log(10 / 3); //3.3333

/////////////////////////////////////////////////
//NOTE #2 Dates and Times

// //Create a date
// const now = new Date();
// console.log(now);

// console.log(new Date('Aug 02 2020'));
// console.log(new Date('December 24, 2021'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 23, 5)); // first mounth is 0

// console.log(new Date(0)); //first date
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); //3 days after first date
// 3 * 24 * 60 * 60 * 1000 - time stamp //time in milliseconds from first date to this

// // Working with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear()); //2037
// console.log(future.getMonth()); //10
// console.log(future.getDate()); //19 (date in month)
// console.log(future.getDay()); //4 (date in week)
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.getMilliseconds());
// console.log(future.toISOString()); //international standarard
// console.log(future.getTime()); // timestamp

// console.log(new Date().getTime()); // timestamp
// console.log(Date.now()); // timestamp

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future);
// console.log(+new Date(2037, 10, 19, 15, 23));

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(days1);

// //Internationalization Dates
// const now = new Date();
// const locale = navigator.language;
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long',
//   year: '2-digit',
//   weekday: 'long',
// };
// console.log(new Intl.DateTimeFormat(locale, options).format(now));
// console.log(new Intl.DateTimeFormat('en-US', options).format(now)); // M/D/Y
// console.log(new Intl.DateTimeFormat('en-GB', options).format(now)); // D/M/Y

// //Internationalization Number
// const num = 3884764.23;
// const options = {
//   style: 'unit',
//   unit: 'celsius',
//   // currency: 'EUR',
// };
// console.log('US:     ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('RO:     ', new Intl.NumberFormat('ro-RO', options).format(num));

/////////////////////////////////////////////////
//NOTE #3 timers
// // setTimeout
// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => {
//     console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`);
//   },
//   3000,
//   ...ingredients
// );
// console.log('Waiting...');
// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// // setInterval
// setInterval(() => {
//   const now = new Date();
//   console.log(now);
// }, 1000);

/////////////////////////////////////////////////
// //NOTE #4 Numeric separatpr (_) ES2022

// // 287,460,000,000
// const diameter = 287_460_000_000;
// console.log(diameter);

// const price = 39_99;
// console.log(price);

// const transferFee1 = 15_00;
// const transferFee2 = 1_500;
// console.log(transferFee1, transferFee2); //exact the same

// console.log(Number('23000'));
// console.log(Number('23_000')); //NaN
