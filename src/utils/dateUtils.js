const timesToMs = {
  second: 1000,
  minute: 60000,
  hour: 3.6e6,
  day: 8.64e7,
  week: 6.048e8,
  month: 2.628e9,
  year: 3.154e10,
  now: Date.now()
};

const stringToMs = string => {
  // format:
  // ex: 1 year from now
};

/**
 * hasDatePassed - determines if a given iso-formatted date string has passed
 * the current date
 *
 * @param {string} date iso-formatted date string
 *
 * @returns {boolean} true if date has passed, false if not
 */
export const hasDatePassed = date => {
  const expiresOn = Date.parse(date);
  const currentDate = Date.parse(new Date().toISOString());

  // true if expiry date has been passed
  return expiresOn < currentDate;
};
