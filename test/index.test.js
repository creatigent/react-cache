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
                return ReactCache.cacheElement(key)(Component, propsToPass);
            }
        } 

        ReactTestUtils.renderIntoDocument(React.createElement(WithState));
    });

};

describe('ReactCache.createElement', () => {

    describe('ReactCache.createElement(\'A\', { a })', () => {
       
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

    describe('ReactCache.createElement(\'A\', { a, cache: \'a\' })', () => {

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

    describe('ReactCache.createElement(\'C\', { a, b, cache: true })', () => {
        
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

    describe('ReactCache.createElement(\'C\', { a, b, static: true })', () => {
        it('never rerender', () => {

            expect.assertions(1);
            return run(null, { a: 0, 'static': true }, { a: 1, 'static': true })
                .then(count => {
                    expect(count).toBe(1);
                });
        });
    });

});
