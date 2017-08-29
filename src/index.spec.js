/* eslint-env jest */
import things from './'

describe('module', () => {
  it('exports things', () => {
    expect(things.length).toBeGreaterThan(0)
  })
})
