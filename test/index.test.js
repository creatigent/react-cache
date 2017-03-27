import * as React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import * as ReactCache from '../lib/index.js'

const run = (cache, initialState, nextState) => {

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
                const { a } = this.state;
                return <Component cache={cache} a={a} />;
            }
        } 

        ReactTestUtils.renderIntoDocument(<WithState />);
    });

};

describe('Component with no \'cache\' prop', () => {

    it('always rerender when props change', () => {

        expect.assertions(1);
        return run(null, { a: 0 }, { a: 1 })
            .then(count => {
                expect(count).toBe(2);
            });
    });

    it('always rerender when props do not change', () => {

        expect.assertions(1);
        return run(null, { a: 0 }, { a: 0 })
            .then(count => {
                expect(count).toBe(2);
            });
    });

});

describe('Component with \'cache\' prop', () => {

    it('rerender if calling the cache function returns false', () => {

        const cache = (nextProps, previousProps) => {
            return nextProps.a === previousProps.a;
        };

        expect.assertions(1);
        return run(cache, { a: 0 }, { a: 1 })
            .then(count => {
                expect(count).toBe(2);
            });
    });

    it('do not rerender if calling the cache function returns true', () => {

        const cache = (nextProps, previousProps) => {
            return nextProps.a === previousProps.a;
        };

        expect.assertions(1);
        return run(cache, { a: 0 }, { a: 0 })
            .then(count => {
                expect(count).toBe(1);
            });
    });

});
