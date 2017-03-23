import * as React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import * as ReactCache from 'src';

let key = 0;

const run = (cache, initialState, nextState) => {

    key++;

    return new Promise((resolve) => {

        let count = 0;

        const Component = () => {
            count++;
            return React.createElement('div');
        };

        class WithState extends React.Component {

            constructor() {
                super();
                this.state = initialState;
            }

            componentDidMount() {
                this.setState(
                    nextState, 
                    () => resolve(count)
                );
            }

            render() {
                const propsToPass = Object.assign({}, 
                    this.state, 
                    cache ? { cache } : null
                );
                return ReactCache.createElement(key)(Component, propsToPass);
            }
        } 

        ReactTestUtils.renderIntoDocument(React.createElement(WithState));
    });

};

describe('ReactCache.createElement', () => {

    describe('ReactCache.createElement(key): key can be', () => {

        it('a positive number', () => {
            const peter = ReactCache.createElement(1);
            expect(peter).toBeTruthy();
        });

        it('a string', () => {
            const steven = ReactCache.createElement('a');
            expect(steven).toBeTruthy();
        });

        it('nothing else', () => {
            expect(() => ReactCache.createElement(-1)).toThrow();
            expect(() => ReactCache.createElement(NaN)).toThrow();
            expect(() => ReactCache.createElement(undefined)).toThrow();
            expect(() => ReactCache.createElement(null)).toThrow();
            expect(() => ReactCache.createElement(true)).toThrow();
            expect(() => ReactCache.createElement(false)).toThrow();
            expect(() => ReactCache.createElement(Boolean(true))).toThrow();
            expect(() => ReactCache.createElement({})).toThrow();
            expect(() => ReactCache.createElement([])).toThrow();
            expect(() => ReactCache.createElement(
                (() => {
                    const A = {};
                    return new A();
                })()
            )).toThrow();
        });
    });

    describe('ReactCache.createElement(key)', () => {

        it('is a function', () => {
            expect(typeof ReactCache.createElement(1) === 'function');
            expect(ReactCache.createElement(1).name === 'createElement');
        });

        it('two calls with the same key return different functions', () => {
            const peter = ReactCache.createElement(1);
            const steven = ReactCache.createElement(1);
            expect(peter).not.toBe(steven);
        });

        it('two calls with different keys return different functions', () => {
            const peter = ReactCache.createElement(1);
            const steven = ReactCache.createElement(2);
            expect(peter).not.toBe(steven);
        });
    });

    describe('ReactCache.createElement(key)(\'A\', { a })', () => {
       
        it('rerender whether \'a\' changes', () => {

            expect.assertions(1);
            return run(null, { a: 0 }, { a: 1 })
                .then(count => {
                    expect(count).toBe(2);
                });
        });

        it('or not', () => {

            expect.assertions(1);
            return run(null, { a: 0 }, { a: 0 })
                .then(count => {
                    expect(count).toBe(2);
                });
        });
    });

    describe('ReactCache.createElement(key)(\'A\', { a, cache: \'a\' })', () => {

        it('rerender when \'a\' is not passed', ()  => {

            expect.assertions(1);
            return run(null, { cache: 'a' }, { cache: 'a' })
                .then(count => {
                    expect(count).toBe(2);
                });
        });

        it('rerender when \'a\' changes', ()  => {

            expect.assertions(1);
            return run(null, { a: 0, cache: 'a' }, { a: 1, cache: 'a' })
                .then(count => {
                    expect(count).toBe(2);
                });
        });

        it('do not rerender when \'a\' does not change', ()  => {

            expect.assertions(1);
            return run(null, { a: 0, cache: 'a' }, { a: 0, cache: 'a' })
                .then(count => {
                    expect(count).toBe(1);
                });
        });

    });

    describe('ReactCache.createElement(key)(\'C\', { c: a + 2b, cache: () => a + 2b })', () => {
        
        const fn = config => config.a + 2 * config.b;

        it('cache the result of the function, rerender if the result has changed', () => {

            expect.assertions(1);
            return run(null, { a: 1, b: 1, cache: fn }, { a: 1, b: 2, cache: fn })
                .then(count => {
                    expect(count).toBe(2);
                });
        });

        it('do not rerender if the result is the same', () => {

            expect.assertions(1);
            return run(null, { a: 1, b: 1, cache: fn }, { a: 1, b: 1, cache: fn })
                .then(count => {
                    expect(count).toBe(1);
                });
        });
    
    });

    describe('ReactCache.createElement(key)(\'C\', { a, b, cache: true })', () => {
        
        it('rerender if any of the props has changed', () => {

            expect.assertions(1);
            return run(null, { a: 0, b: 0, cache: true }, { a: 0, b: 1, cache: true })
                .then(count => {
                    expect(count).toBe(2);
                });
        });

        it('do not rerender if none of the props has changed', () => {

            expect.assertions(1);
            return run(null, { a: 0, b: 0, cache: true }, { a: 0, b: 0, cache: true })
                .then(count => {
                    expect(count).toBe(1);
                });         
        });

    });

    describe('ReactCache.createElement(key)(\'C\', { a, b, static: true })', () => {
        it('never rerender', () => {

            expect.assertions(1);
            return run(null, { a: 0, 'static': true }, { a: 1, 'static': true })
                .then(count => {
                    expect(count).toBe(1);
                });
        });
    });

});
