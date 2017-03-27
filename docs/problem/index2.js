var React = window.React;
var ReactDOM = window.ReactDOM;

var h = React.createElement;
var render = ReactDOM.render;

function Component(props) {
    console.log(props);
    return h('div', null, props.value);
}

function NestedCache() {
    var cache;
    var element;
    return function(props) {
        if (!cache || cache.value !== props.value) {
            cache = props;

            element = h(Component, {
                displayName: 'nested Cache',
                name: props.name,
                value: props.value
            });
            return element;
        } else {
            return element;
        }
    };
}

function partialIncrement(param) {
    return function(state, props) {
        return Object.getOwnPropertyNames(state).reduce(
            function(nextState, key) {
                nextState[key] = (key === param)
                    ? state[key] + 1
                    : state[key];
                return nextState;
            },
            {}
        );
    };
}

var ContainerCache = function() {

    var Cache = {
        a: { value: undefined, Component: undefined, },
        b: { value: undefined, Component: undefined, }
    };

    return React.createClass({

        getInitialState: function() {
            return {
                A: 0,
                B: 0
            };
        },

        render: (function() {
            
            var _eA, _vA;
            var _eB, _vB;
            
            return function() {

            console.log('****************');
            console.log('rendering from cached Container');

            var param = this.props.param;
            var a = this.state.A;
            var b = this.state.B;
            
            if (Cache.a.value !== a) {
                Cache.a.value = a;
                Cache.a.Component = h(Component, { 
                    displayName: 'cached Component',
                    name: 'A', 
                    value: a 
                });
            }

            if (Cache.b.value !== b) {
                Cache.b.value = b;
                Cache.b.Component = h(Component, { 
                    displayName: 'cached Component',
                    name: 'B', 
                    value: b 
                });
            }

            return h('div', null, [
                h(Component, { name: 'A', value: a }),
                h(Component, { name: 'B', value: b }),
                h(NestedCache(), { name: 'A', value: a }),
                h(NestedCache(), { name: 'B', value: b }),
                Cache.a.Component,
                Cache.b.Component,
                (function(_a) {
                    if (!_eA || _vA !== _a) {
                        _vA = _a;
                        _eA = h(Component, { 
                            displayName: 'cached Component',
                            name: 'A', 
                            value: _a 
                        });
                    }
                    return _eA;
                })(a),
                (function(_b) {
                    console.log(_eB, _vB, _b);
                    if (!_eB || _vB !== _b) {
                        _vB = _b;
                        _eB = h(Component, { 
                            displayName: 'cached Component',
                            name: 'B', 
                            value: _b 
                        });
                    }
                    return _eB;
                })(b),
                h('button', 
                    {
                        onClick: function() {
                            this.setState(
                                partialIncrement(this.props.param)
                            );              
                        }.bind(this)
                    },
                    'increment ' + param
                )
            ]);

            }
        })()
    });
};

render(
    h(ContainerCache(), { param: 'A' }),
    document.getElementById('root')
);
