import * as React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Cache } from 'src';

const run = (initialState, nextState) => {

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
				this._cached = Cache(Component);
			}

			componentDidMount() {
				this.setState(
					nextState, 
					() => resolve(count)
				);
			}

			render() {
				const propsToPass = Object.getOwnPropertyNames(initialState).reduce(
					(toPass, name) => {
						toPass[name] = this.state[name];
						return toPass;
					},
					{}
				);
				return React.createElement(this._cached, propsToPass);
			}
		} 

		ReactTestUtils.renderIntoDocument(<WithState />);
	});

};

describe('Cache', () => {

	describe('wraps a component in order to', () => {

		it('re-render if a prop changes', () => {
			expect.assertions(1);
			return run({ a: 0, b: 0 }, { a: 1, b: 0 }).then(count => {
				expect(count).toBe(2);
			});
		});

		it('not re-render if none of the props change', () => {
			expect.assertions(1);
			return run({ a: 0, b: 0 }, { a: 0, b: 0 }).then(count => {
				expect(count).toBe(1);
			});
		});

		it('not re-render if there are no props', () => {
			expect.assertions(1);
			return run({}, {}).then(count => {
				expect(count).toBe(1);
			});
		});

	});

});
