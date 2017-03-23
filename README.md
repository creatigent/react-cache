# react-cache


#### usage with React

```
npm install --save react-cache
```

Always rerender, unless A has lifecycle and sets shouldComponentUpdate  
If using babel-plugin-react-cache then `ReactCache.createElement` should never 
face this case
```js
ReactCache.createElement('A', { a })
```

Rerender only when b changes
```js
ReactCache.createElement('B', { b, cache: 'b' })   
```

If using babel-plugin-react-cache, also works on computed values
```js
ReactCache.createElement('C' { computed, cache: 'computed' })
```

If using babel-plugin-react-cache, also works on outer scope variables
```js
ReactCache.createElement('D' {outerScopeVariable, cache: 'outerScopeVariable' })
```

Cache the result of a function, then rerender only if the result has changed
```js
ReactCache.createElement('E', { e: a + 2b, cache: () => a + 2b })
```

Do not rerender if none of the props has changed
```js
ReactCache.createElement('F', { a, b, cache: true })
```

Never rerender
```js
ReactCache.createElement('S', { static })   
```

#### usage with jsx

```
npm install --save babel-plugin-transform-react-cache
```

You need `babel-plugin-transform-react-cache` to run AFTER `babel-plugin-transform-react-jsx`.

Always rerender, unless A has lifecycle and sets shouldComponentUpdate
```jsx
<A a={a} />
```
      
Rerender only when b changes
```jsx      
<B b={b} cache='b' />
```

Also works on computed values
```jsx
<C c={c} cache='c' />
```

And on outer scope variables
```jsx      
<D d={outerScopeVariable} cache='outerScopeVariable' />
```

Cache the result of a function, then rerender only if the result has changed
```jsx
<E e={(a + 2b)} cache={() => a + 2b} />
```

Do not rerender if none of the props has changed
```jsx      
<F a={a} b={b} cache />
```

Never rerender
```jsx
<S static /> 
