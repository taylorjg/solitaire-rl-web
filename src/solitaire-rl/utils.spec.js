import * as U from './utils.mjs'

describe('utils', () => {

  it('range', () => {
    expect(U.range(5)).toEqual([0, 1, 2, 3, 4])
  })

  it('rangeIter', () => {
    expect(Array.from(U.rangeIter(5))).toEqual([0, 1, 2, 3, 4])
  })

  it('zip same lengths', () => {
    const xs = [1, 2, 3]
    const ys = [4, 5, 6]
    const zs = U.zip(xs, ys)
    expect(zs).toEqual([[1, 4], [2, 5], [3, 6]])
  })

  it('zip xs shorter', () => {
    const xs = [1, 2]
    const ys = [4, 5, 6]
    const zs = U.zip(xs, ys)
    expect(zs).toEqual([[1, 4], [2, 5]])
  })

  it('zip ys shorter', () => {
    const xs = [1, 2, 3]
    const ys = [4, 5]
    const zs = U.zip(xs, ys)
    expect(zs).toEqual([[1, 4], [2, 5]])
  })

  it('fst', () => {
    expect(U.fst([12, 42])).toEqual(12)
  })

  it('snd', () => {
    expect(U.snd([12, 42])).toEqual(42)
  })

  it('padInt', () => {
    expect(U.padInt(12, 3)).toEqual(' 12')
  })

  it('padReal (without width)', () => {
    expect(U.padReal(12.1239, 3)).toEqual('12.124')
  })

  it('padReal (with width)', () => {
    expect(U.padReal(12.1239, 3, 8)).toEqual('  12.124')
  })

  it('moveToLast (element present)', () => {
    const xs = [0, 1, 2, 3, 4, 99, 6, 7, 8, 9]
    U.moveToLast(xs, x => x === 99)
    expect(xs).toEqual([0, 1, 2, 3, 4, 6, 7, 8, 9, 99])
  })

  it('moveToLast (element not present)', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    U.moveToLast(xs, x => x === 99)
    expect(xs).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('mean', () => {
    expect(U.mean([1, 2, 3, 4, 5])).toEqual(3)
  })
})
