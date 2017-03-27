import * as React from 'react';

const createElement = ref =>
	ref 
        ? (type, props, children) => {
                if (!ref.e || !ref(props, ref.p || {})) {
                    ref.p = props;
                    ref.e = React.createElement(type, props, children);
                }
                return ref.e;
            }
        : React.createElement;

export { createElement };
