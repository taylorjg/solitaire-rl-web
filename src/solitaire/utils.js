export const range = n => Array.from(Array(n).keys())

export function* rangeIter(n) {
  for (let index = 0; index < n; index++) {
    yield index
  }
}

export const zip = (xs, ys) => {
  const len = Math.min(xs.length, ys.length)
  return range(len).map(index => [xs[index], ys[index]])
}

export const fst = pair => pair[0]
export const snd = pair => pair[1]

export const padInt = (n, w) => n.toString().padStart(w)
export const padReal = (n, f, w) => w ? n.toFixed(f).padStart(w) : n.toFixed(f)
