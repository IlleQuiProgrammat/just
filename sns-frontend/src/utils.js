export const pad = (initialO, paddingChar, minLength) => {
  let initial = initialO.toString();
  let length = minLength - initial.length;
  if (length <= 0) {
    return initial;
  }
  return paddingChar.repeat(length) + initial;
}

export const dateFormatter = epoch => {
  let d = new Date(epoch * 1000)
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${pad(d.getHours(), '0', 2)}:${pad(d.getMinutes(), '0', 2)}`
};

export const getStatusFromNumber = n => {
  if (n === 0) return 'unresolved'
  if (n === 1) return 'spam'
  if (n === 2) return 'resolved'
  console.log(n);
}