export const display_time = (seconds) => {
  let base, century, day, display_num, display_str, hour, minute, month, ref, year
  minute = 60
  hour = minute * 60
  day = hour * 24
  month = day * 31
  year = month * 12
  century = year * 100;
  (ref =
    seconds < 1
      ? [null, "less than a second"]
      : seconds < minute
      ? ((base = Math.round(seconds)), [base, base + " second"])
      : seconds < hour
      ? ((base = Math.round(seconds / minute)), [base, base + " minute"])
      : seconds < day
      ? ((base = Math.round(seconds / hour)), [base, base + " hour"])
      : seconds < month
      ? ((base = Math.round(seconds / day)), [base, base + " day"])
      : seconds < year
      ? ((base = Math.round(seconds / month)), [base, base + " month"])
      : seconds < century
      ? ((base = Math.round(seconds / year)), [base, base + " year"])
      : [null, "centuries"]),
    (display_num = ref[0]),
    (display_str = ref[1]);
  if (display_num != null && display_num !== 1) {
    display_str += "s"
  }
  return display_str
};
