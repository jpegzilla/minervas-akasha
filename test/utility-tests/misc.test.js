import { expect, should } from 'chai'

import {
  isEmpty,
  secondsToTime,
  bytesToSize,
  str2ab,
  getRandomInt,
  uuidv4,
  validateUUIDv4,
  stringSort
} from './../../src/utils/misc.js'

const testObject = {
  empty: {},
  notEmpty: { foo: 'bar' },
  validuuid: '561c8d30-1d92-4416-9f9b-643ad39ae4c0',
  invaliduuid: '561c8d30-1d92-4416-9f9b-643ad39ae4c',
  unsortedArrayStrings: ['d', 'a', 'c', 'b'],
  unsortedArrayObjects: [
    { letter: 'd' },
    { letter: 'a' },
    { letter: 'c' },
    { letter: 'b' }
  ]
}

describe(`miscellaneous utility tests  -- ${new Date().toLocaleString()}\r\n`, () => {
  // isEmpty
  describe('isEmpty tests', () => {
    it('should return true if given an empty object', () => {
      expect(isEmpty(testObject.empty)).to.be.true
    })

    it('should return false if given a non-empty object', () => {
      expect(isEmpty(testObject.notEmpty)).to.be.false
    })

    it('should throw an error if not given an object', () => {
      expect(isEmpty([])).to.throw
    })
  })

  // secondsToTime
  describe('secondsToTime tests', () => {
    it('should return a string', () => {
      expect(secondsToTime(3333)).to.be.a('string')
    })

    it('should return the correct time', () => {
      expect(secondsToTime(3333)).to.equal('00:55:33')
    })

    it('should throw an error if not given a number', () => {
      expect(() => secondsToTime({})).to.throw()
    })
  })

  // bytesToSize
  describe('bytesToSize tests', () => {
    it('should return a string', () => {
      expect(bytesToSize(3000)).to.be.a('string')
    })

    it('should return the correct size', () => {
      expect(bytesToSize(3000)).to.equal('3kb')
    })

    it('should throw an error if not given a number', () => {
      expect(() => bytesToSize('a')).to.throw()
    })
  })

  // str2ab
  describe('str2ab tests', () => {
    it('should return an array buffer', () => {
      expect(str2ab('a') instanceof ArrayBuffer).to.be.true
    })

    it('should return the correct array buffer', () => {
      expect(new Int16Array(str2ab('a'))[0]).to.equal(97)
    })

    it('should throw an error if not given a string', () => {
      expect(() => str2ab(1)).to.throw()
    })
  })

  // getRandomInt
  describe('getRandomInt tests', () => {
    it('should return a number', () => {
      expect(getRandomInt(3, 4)).to.be.a('number')
    })

    it('should throw an error if not called with numbers', () => {
      expect(() => getRandomInt(null, 'a')).to.throw()
    })
  })

  // uuidv4
  describe('uuidv4 tests', () => {
    it('should return a string', () => {
      expect(uuidv4()).to.be.a('string')
    })

    it('should be a valid uuidv4', () => {
      expect(validateUUIDv4(uuidv4())).to.be.true
    })
  })

  // validateUUIDv4
  describe('validateUUIDv4 tests', () => {
    it('should return a boolean', () => {
      expect(validateUUIDv4(testObject.validuuid)).to.be.a('boolean')
    })

    it('should return true given a valid uuidv4', () => {
      expect(validateUUIDv4(testObject.validuuid)).to.be.true
      expect(validateUUIDv4(uuidv4())).to.be.true
      expect(validateUUIDv4('2b65b6c3-1ce2-44b6-a83b-bafd89394928')).to.be.true
    })

    it('should return false given an invalid uuidv4', () => {
      expect(validateUUIDv4(testObject.invaliduuid)).to.be.false
      expect(validateUUIDv4('2b65b6c3-12-44b6-a83b-bafd89394928')).to.be.false
      expect(validateUUIDv4('dbf43b5a.881c-4b38-a052-563079062184')).to.be.false
    })

    it('should throw an error given anything other than a string', () => {
      expect(() => validateUUIDv4({})).to.throw()
      expect(() => validateUUIDv4(1)).to.throw()
    })
  })

  // stringSort
  describe('stringSort tests', () => {
    it('should return an array', () => {
      expect(stringSort(testObject.unsortedArrayStrings)).to.be.an('array')
    })

    it('should throw an error if not given an array', () => {
      expect(() => stringSort({})).to.throw()
      expect(() => stringSort('')).to.throw()
      expect(() => stringSort(1)).to.throw()
    })

    it('should return a sorted array (ascending order)', () => {
      expect(stringSort(testObject.unsortedArrayStrings), false).to.deep.equal([
        'd',
        'c',
        'b',
        'a'
      ])
    })

    it('should return a sorted array (descending order)', () => {
      expect(stringSort(testObject.unsortedArrayStrings, true)).to.deep.equal([
        'a',
        'b',
        'c',
        'd'
      ])
    })

    it('should sort an array of objects by a specified key (ascending order)', () => {
      expect(
        stringSort(testObject.unsortedArrayObjects, true, 'letter')
      ).to.deep.equal([
        { letter: 'a' },
        { letter: 'b' },
        { letter: 'c' },
        { letter: 'd' }
      ])
    })

    it('should sort an array of objects by a specified key (descending order)', () => {
      expect(
        stringSort(testObject.unsortedArrayObjects, false, 'letter')
      ).to.deep.equal([
        { letter: 'd' },
        { letter: 'c' },
        { letter: 'b' },
        { letter: 'a' }
      ])
    })
  })
})
