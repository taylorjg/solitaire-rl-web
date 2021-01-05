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

export const moveToLast = (xs, predicate) => {
  const index = xs.findIndex(predicate)
  if (index >= 0) {
    const [x] = xs.splice(index, 1)
    xs.splice(xs.length, 0, x)
  }
}

export const mean = xs => {
  const count = xs.length
  const sum = xs.reduce((acc, x) => acc + x, 0)
  return sum / count
}

export const formatElapsedTime = ms => {
  const s = ms / 1000
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = Math.floor(s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}
