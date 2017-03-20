import * as React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import * as ReactCache from 'src';

const run = (cache, initialState, nextState) => {

	return new Promise((resolve) => {

		let count = 0;

		const Component = () => {
			count++;
			return (<div />);
		};

		class WithState extends React.Component {

			constructor() {
				super();
				this.state = initialState;
				key++;
			}

			componentDidMount() {
				this.setState(
					nextState, 
					() => resolve(count)
				);
			}

			render() {
				const propsToPass = Object.assign({}, this.state, { cache });
				return React.cacheElement(Component, propsToPass);
			}
		} 

		ReactTestUtils.renderIntoDocument(<WithState />);
	});

};

describe('ReactCache.createElement', () => {

	describe('ReactCache.createElement(\'A\', { a })', () => {
	   
		it('rerender whether \'a\' changes', () => {

	   		expect.assertions(1);
	   		run(null, { a: 0 }, { a: 1 }).then(count => {
	   			expect(count).toBe(2);
	   		});
		});

		it('or not', () => {

	   		expect.assertions(1);
	   		run(null, { a: 0 }, { a: 0 }).then(count => {
	   			expect(count).toBe(2);
	   		});
		});
	});

	describe('ReactCache.createElement(\'A\', { a, cache: \'a\' })', () => {

	    it('rerender when \'a\' changes', ()  => {

	   		expect.assertions(1);
	   		run(null, { a: 0, cache: 'a' }, { a, 1: cache: 'a' }).then(count => {
	   			expect(count).toBe(2);
	   		});
		});

		it('do not rerender when \'a\' does not change', ()  => {

	   		expect.assertions(1);
	   		run(null, { a: 0, cache: 'a' }, { a: 0, cache: 'a' }).then(count => {
	   			expect(count).toBe(1);
	   		});
		});
	});

	it('ReactCache.createElement(\'C\', { c: a + 2b, cache: () => a + 2b })', () => {
	    
	    const fn = (a, b) => a + 2*b;

	    it('cache the result of the function, rerender if the result has changed', () => {

	    	expect.assertions(1);
	   		run(null, { c: fn(1, 1), cache: fn }, { c: fn(1, 2), cache: fn }).then(count => {
	   			expect(count).toBe(2);
	   		});
	    });

	    it('do not rerender if the result is the same', () => {

	    	expect.assertions(1);
	   		run(null, { c: fn(1, 1), cache: fn }, { c: fn(1, 1), cache: fn }).then(count => {
	   			expect(count).toBe(1);
	   		});
	    });
	
	});

	it('ReactCache.createElement(\'C\', { a, b, cache: true })', () => {
	    
	    it('rerender if any of the props has changed', () => {

	    	expect.assertions(1);
	   		run(null, { a: 0, b: 0, cache: true }, { a: 0, b: 1, cache: true }).then(count => {
	   			expect(count).toBe(2);
	   		});
	   	});

	    it('do not rerender if none of the props has changed', () => {

	    	expect.assertions(1);
	   		run(null, { a: 0, b: 0, cache: true }, { a: 0, b: 0, cache: true }).then(count => {
	   			expect(count).toBe(1);
	   		});	    	
	   	});

	});

	it('ReactCache.createElement(\'C\', { a, b, static: true })', () => {
	    it('never rerender', () => {

	    	expect.assertions(1);
	   		run(null, { a: 0, 'static': true }, { a: 1, 'static': true }).then(count => {
	   			expect(count).toBe(1);
	   		});
	    });
	});
});
