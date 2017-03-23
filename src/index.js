import * as React from 'react';

const container = {};

const isNotValid = key => !(key > 0 || key === 0);

const accessCache = key => {

    if (isNotValid(key)) {
        throw new Error(
            'ReactCache.cacheElement needs a unique key number to create a cached element.\n' +
            'Usage: ReactCache.cacheElement(key)(type, props, children)\n' +
            '(hint: you can use namespaces to generate a unique key).'
        );
    }

    if (!container[key]) {
        container[key] = null;
    }

    return {
        cache: container[key],
        ignoreCache: (type, props, children) => {
            const element = React.createElement(type, props, children);
            return {
                andReturnElement: () => element
            };
        },
        setCache: (type, props, children) => {
            const element = React.createElement(type, props, children);
            const cache = container[key] = { 
                props, 
                element
            };
            return {
                andReturnElement: () => element
            };
        }
    };
};

/**
 * ReactCache.createElement()
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
 * Do not rerender if none of the props has changed
 * ReactCache.createElement('E', { a, b, cache: true })
 * 
 * Never rerender
 * ReactCache.createElement('S', { static })   
 */
const cacheElement = key => {

    const { cache, ignoreCache, setCache } = accessCache(key);

    return function createElement(type, props, children) {
        
        const cacheProp = props && props.cache;

        if (!cacheProp && !props.static) {
            return ignoreCache(type, props, children)
                .andReturnElement();
        }         

        if (!cache) {
            return setCache(type, props, children)
                .andReturnElement();
        }

        if (props.static) {
            return cache.element;
        }

        if (typeof cacheProp === 'string') {

            const next = props[cacheProp];

            if (next === undefined) {
                return ignoreCache(type, props, children)
                    .andReturnElement();     
            }

            return (cache.props[cacheProp] !== next)
                ? setCache(type, props, children).andReturnElement()
                : cache.element;
        }

        if (cacheProp === true) {

            const hasChanged = Object.getOwnPropertyNames(props)
                .filter(name => name !== 'cache')
                .reduce(
                    (changed, name) => 
                        changed 
                        || (cache.props[name] !== props[name]),
                    false
                );

            return hasChanged
                ? setCache(type, props, children).andReturnElement()
                : cache.element;
        }
    };
};

export { cacheElement };
