import * as React from 'react';

const Cache = Component => {

	class C extends React.Component {

		constructor(props) {
			super(props);
		}

		shouldComponentUpdate(nextProps) {
			return Object.getOwnPropertyNames(nextProps).reduce(
				(should, name) => should || (this.props[name] !== nextProps[name]),
				false
			);
		}

		render() {
			return <Component {...this.props} />;
		}
	}

	C.displayName = `Cache(${Component.displayName || Component.name}`;

	return C;
};

export { Cache };
