const calculatePercentage = (todayCount, yesterdayCount) => {
  let percentageChange = 0;

  if (yesterdayCount > 0) {
    percentageChange = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
  } else if (todayCount > 0) {
    percentageChange = 100; // new growth
  }

  return percentageChange;
};

module.exports = { calculatePercentage };
