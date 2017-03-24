import * as React from 'react';

const container = {};

const isNotValid = key => (typeof key === 'string') ? false
    : ((typeof key === 'number') && (key >= 0)) ? false
    : true;

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
const createElement = key => {

    if (isNotValid(key)) {
        throw new Error(
            'ReactCache.cacheElement needs a unique key (number or string) to create a cached element.\n' +
            'Usage: ReactCache.cacheElement(key)(type, props, children)\n' +
            'Hint: you can use namespaces to generate a unique key.'
        );
    }

    const cache = container[key];

    const createElement = (type, props, children) => {
        
        const cacheProp = props && props.cache;

        if (!cacheProp && !props.static) {
            return React.createElement(type, props, children);
        }         

        if (!cache) {
            const next = cacheProp === true ? props
                : typeof cacheProp === 'string' ? props[cacheProp]
                : typeof cacheProp === 'function' && cacheProp(props);

            const element = React.createElement(type, props, children);
            container[key] = { 
                value: next, 
                element
            };

            return element;
        }

        if (props.static) {
            return cache.element;
        }

        return getElement(key, cacheProp, cache, type, props, children);
    };
    createElement.propTypes = {
        cache: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string,
            React.PropTypes.func
        ]),
        'static': React.PropTypes.bool
    };

    return createElement;
};

export { createElement };

function resolveNextTrue(cacheProp, props, cache) {
    return { 
        hasChanged: Object.getOwnPropertyNames(props)
            .filter(name => name !== 'cache')
            .reduce(
                (changed, name) => 
                    changed 
                    || (cache.value[name] !== props[name]),
                false
            ),
        next: props 
    };
}

function resolveNextString(cacheProp, props, cache) {
    const next = props[cacheProp];
    return {
        hasChanged: next === undefined || (cache.value !== next),
        next
    };
}

function resolveNextBoolean(cacheProp, props, cache) {
    const next = cacheProp(props);
    return {
        hasChanged: next !== cache.value,
        next
    };
}

function getElement(key, cacheProp, cache, type, props, children) {

    let resolveNext;

    if (cacheProp === true) {
        resolveNext = resolveNextTrue;
    }

    if (typeof cacheProp === 'string') {
        resolveNext = resolveNextString;
    }

    if (typeof cacheProp === 'function') {
        resolveNext = resolveNextBoolean;
    }

    const { hasChanged, next } = resolveNext(cacheProp, props, cache);

    if (hasChanged) {
        const element = React.createElement(type, props, children);
        container[key] = { 
            value: next, 
            element
        };
        return element;
    } else {
        return cache.element;
    }
}