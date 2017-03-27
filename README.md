# react-cache


## Installation

```
npm install --save react-cache babel-plugin-transform-react-cache
```

You need `babel-plugin-transform-react-cache` to run AFTER `babel-plugin-transform-react-jsx`.

```
npm install --save react-cache babel-plugin-transform-react-jsx
```

#### .babelrc
```
{
    plugins: [transform-react-jsx, transform-react-cache]
}
```
      
## Examples

Rerender only when a changes
```jsx      
<A a={a} b={b} cache={(nextProps, oldProps) => nextProps.a !== oldProps.a} />
```

Always rerender
```jsx      
<A a={a} b={b} cache={() => false} />
```

Never rerender
```jsx      
<A a={a} b={b} cache={() => true} />
```
