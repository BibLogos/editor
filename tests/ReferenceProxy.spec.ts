import { ReferenceProxy } from '../frontend/src/Classes/ReferenceProxy'

test('ReferenceProxy', () => {
    const reference1 = new ReferenceProxy('JHN.1.26.11:JHN.1.28.11')

    expect(reference1.includes('JHN', 1, 26, 11)).toBeTruthy()
    expect(reference1.includes('JHN', 1, 28, 11)).toBeTruthy()
    expect(reference1.includes('JHN', 1, 29, 11)).toBeFalsy()

    const reference2 = new ReferenceProxy('JHN.1.4.5:JHN.1.7.13')
    expect(reference2.includes('JHN', 1, 7, 1)).toBeTruthy()
    expect(reference2.includes('JHN', 1, 7, 2)).toBeTruthy()

})