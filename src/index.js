import * as React from 'react';

const cache = {};

const createCache = (type, config, children) => {
	return { 
		element: React.createElement(type, config, children),
		props: config
	};
};

const createCachedElement = (prefix, key) => {

	const fullKey = `prefix.${key}`;

	return (type, config, children) => {
		if(!cache[fullKey]) {
			cache[fullKey] = createCache(type, config, children);
		} else {
			const props = cache[fullKey].props || {};
			const shouldUpdate = Object.getOwnPropertyNames(config).reduce(
				(should, name) => should || (name !== 'cache') && (props[name] !== config[name]),
				false
			);

			if (shouldUpdate) {
				cache[fullKey] = createCache(type, config, children);
			}
		}

		return cache[fullKey].element;
	};

};

const createElement = (type, config, children) => {

	if (!config || !config.cache) {
		return React.createElement(type, config, children);
	}

	const { cacheKey } = config;
	if (!cacheKey) {
		throw new Error(
			'A cached element needs a cache key and it must be unique\n' +
			'for a given Component type.\n' +
			'The component type is used to prefix the final key.\n' +
			'Please check props.cache = { key: unique_key }\n' +
			'(hint: you can use namespaces to generate a unique key).'
		);
	}

	const prefix = type.displayName 
		|| type.name 
		|| type.toString && type.toString();

	if (!prefix) {
		throw new Error(
			'It is impossible to resolve the Component type to generate a key prefix.\n' +
			'The prefix is resolved in the following order:\n' +
			'Component.displayName > Component.name > Component.toString()\n' +
			'Please add one of the above properties to the component.'
		);	
	}

	return createCachedElement(prefix, cacheKey)(type, config, children);
};

export { createElement };
