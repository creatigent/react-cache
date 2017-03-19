'use strict';

function fn(a, b) {
	return ReactCache.createElement('div', { cache: true, a: 1 });
}

function fn2(a, b) {
	return React.createElement('div', { cache: false, a: 1 });
}

function fn3(a, b) {
	return React.createElement('div', { a: 1 });
}
