import { ReferenceProxy } from '../frontend/src/Classes/ReferenceProxy'

test('ReferenceProxy', () => {
    const reference = new ReferenceProxy('JHN.1.26.11:JHN.1.28.11')

    expect(reference.includes('JHN', 1, 26, 11)).toBeTruthy()
    expect(reference.includes('JHN', 1, 28, 11)).toBeTruthy()
    expect(reference.includes('JHN', 1, 29, 11)).toBeFalsy()
  })