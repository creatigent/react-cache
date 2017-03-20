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

/**
 * ReactCache.createElement
 * Wrapper around React.createElement
 *
 * Usage:
 * https://gist.github.com/msuperina/2b87d781ae5455ce674961aa33276d5f
 * 
 * Always rerender, unless A has lifecycle and sets shouldComponentUpdate
 * If using babel-plugin-react-cache then ReactCache.createElement should never 
 * face this case
 * ReactCache.createElement('A', { a })
 *
 * Rerender only when b changes
 * ReactCache.createElement('B', { b, cache: 'b' })   
 *
 * If using babel-plugin-react-cache, also works on computed values
 * ReactCache.createElement('C' { computed, cache: 'computed' })
 * 
 * If using babel-plugin-react-cache, also works on outer scope variables
 * ReactCache.createElement('D' {outerScopeVariable, cache: 'outerScopeVariable' })
 * 
 * Cache the result of a function, then rerender only if the result has changed
 * ReactCache.createElement('E', { e: a + 2b, cache: () => a + 2b })
 * 
 * Do not rerender if none of the props has changed
 * ReactCache.createElement('F', { a, b, cache: true })
 * 
 * Never rerender
 * ReactCache.createElement('S', { static })   
 */
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
