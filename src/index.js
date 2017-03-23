import * as React from 'react';

const container = {};

const isNotValid = key => !(key > 0 || key === 0);

const accessContext = key => {

    if (isNotValid(key)) {
        throw new Error(
            'ReactCache.cacheElement needs a unique key number to create a cached element.\n' +
            'Usage: ReactCache.cacheElement(key)(type, config, children)\n' +
            '(hint: you can use namespaces to generate a unique key).'
        );
    }

    if (!container[key]) {
        container[key] = null;
    }

    return {
        context: container[key],
        ignoreContext: (type, config, children) => {
            const element = React.createElement(type, config, children);
            return {
                andReturnElement: () => element
            };
        },
        setContext: (type, config, children) => {
            const element = React.createElement(type, config, children);
            const context = container[key] = { 
                config, 
                element
            };
            const toReturn = {
                andReturnElement: () => element,
                withFnValue: fnValue => {
                    context.fnValue = fnValue;
                    return toReturn;
                }
            };
            return toReturn;
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
 * Cache the result of a function, then rerender only if the result has changed
 * ReactCache.createElement('E', { e: a + 2b, cache: () => a + 2b })
 * 
 * Do not rerender if none of the props has changed
 * ReactCache.createElement('F', { a, b, cache: true })
 * 
 * Never rerender
 * ReactCache.createElement('S', { static })   
 */
const cacheElement = key => {

    const { context, ignoreContext, setContext } = accessContext(key);

    return function createElement(type, config, children) {
        
        const cache = config && config.cache;

        if (!cache && !config.static) {
            return ignoreContext(type, config, children)
                .andReturnElement();
        }         

        if (!context) {
            return setContext(type, config, children)
                .withFnValue((typeof cache === 'function') ? cache(config) : null)
                .andReturnElement();
        }

        if (config.static) {
            return context.element;
        }

        if (typeof cache === 'string') {

            const next = config[cache];

            if (next === undefined) {
                return ignoreContext(type, config, children)
                    .andReturnElement();     
            }

            return (context.config[cache] !== next)
                ? setContext(type, config, children).andReturnElement()
                : context.element;
        }

        if (cache === true) {

            const hasChanged = Object.getOwnPropertyNames(config)
                .filter(name => name !== 'cache')
                .reduce(
                    (changed, name) => 
                        changed 
                        || (context.config[name] !== config[name]),
                    false
                );

            return hasChanged
                ? setContext(type, config, children).andReturnElement()
                : context.element;

        }

        if (typeof cache === 'function') {

            const fnValue = cache(config);

            return (fnValue !== context.fnValue)
                ? setContext(type, config, children)
                    .withFnValue(fnValue)
                    .andReturnElement()
                : context.element;
        }
    };
};

export { cacheElement };
