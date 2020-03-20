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

/**
 * naturalDate - takes in a natural language date string, outputs time in ms
 *
 * @param {string} string string such as "in 1 week and 2 days from now"
 *
 * @returns {number} date (in milliseconds since 1 jan 1970)
 */
export const naturalDate = string => {
  // format:
  // ex: 1 year from now
  // ex: 2 weeks and 1 month from now
  const timeNames = Object.keys(timesToMs);

  const datesWithUnits = string
    .match(/\d+(?:\s[^\d\s]+)/gi)
    .map(item => item.trim());

  const from =
    string.endsWith("from today") ||
    string.endsWith("from now") ||
    string.startsWith("in");

  let totalTime = 0;

  datesWithUnits.forEach(item => {
    const [num, type] = item.match(/\d+|\w+/gi);

    const adjustedType = timeNames.find(n => new RegExp(n, "gi").test(type));

    const ms = num * timesToMs[adjustedType];

    totalTime += ms;
  });

  if (!from)
    throw new Error(
      "invalid time. must specify 'from now', 'from today', or 'in'."
    );

  return timesToMs.now + totalTime;
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
