const assert = require('assert')

const main = () => {
  const ts = [1, 2, 3, 4, 5, 6, 7, 8]
  const Rs = [4, 4, 4, 4, 4, 4, 2, 2]
  assert(Rs.length === ts.length)

  // -1 means 1/(t-1)
  const ans = [1, 1/2, 1/8, -1]

  ans.forEach(an => {
    console.log('-'.repeat(80))
    console.log(`an: ${an > 0 ? an : '1/(t-1)'}`)
    let Qn = 0
    ts.forEach((t, index) => {
      const Rn = Rs[index]
      const a = an > 0 ? an : 1/(t - 1)
      // Qn1 === Qn + a * (Rn - Qn)
      const Qn1 = t === 1 ? Rn : Qn + a * (Rn - Qn)
      console.log(`t: ${t}; Qn1: ${Qn1}; Rn: ${Rn}; Qn: ${Qn}; a: ${a}`)
      Qn = Qn1
    })
  })
}

main()
