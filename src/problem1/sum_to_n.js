var sum_to_n_a = function (n) {
  if (n === 0) return 0

  let sum = 0
  for (let i = 1; i <= Math.abs(n); i++) {
    sum += i
  }

  return n > 0 ? sum : -sum
}

var sum_to_n_b = function (n) {
  if (n >= 0) return (n * (n + 1)) / 2

  return (-n * (n - 1)) / 2
}

var sum_to_n_c = function (n) {
  if (n === 0) return 0

  if (n > 0) return n + sum_to_n_c(n - 1)

  return n + sum_to_n_c(n + 1)
}
