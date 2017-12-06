import {expect} from 'chai'
import {esimorp} from '../src/esimorp'

describe('esimorp', () => {
    it('should asynchronously add two numbers', async() => {
        const obj = {a: async arg1 => ({
            b: async arg2 => arg1 + arg2
        })}
        expect(await esimorp(obj).a(1).b(2)).to.equal(3)    
    })
})