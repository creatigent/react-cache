module.exports = function(babel) {
	var t = babel.types;

	return {
		visitor: {
			CallExpression: function(path) {
				if (calleeDoesMatch(t, path.node.callee)
					&& argumentDoesMatch(t, path.node.arguments)) {
					
					replacePath(t, path);
				}
			}
		}
	};
};

function calleeDoesMatch(t, callee) {
	return t.isMemberExpression(callee)
		&& callee.object
		&& callee.property
		&& t.isIdentifier(callee.object, { name: 'React' })
		&& t.isIdentifier(callee.property, { name: 'createElement' });
}

function argumentDoesMatch(t, nodeArguments) {
	const config = (nodeArguments || [])[1];

	if (t.isCallExpression(config)) {
		// <Component propA={...} propB={...} {...otherProps} />
		const configArguments = config.arguments;
		for (var i = 0; i < configArguments.length; i++) {
			const argument = configArguments[i];
			// <Component propA={...} propB={...} />
			if (t.isObjectExpression(argument)) {
				if(objectHasPropertyMatch(t, argument)) {
					return true;
				}
			}
			if (t.isIdentifier(argument)) {
				// <Component {...otherProps} />
				// check scope to resolve otherProps key/value pairs
				// const variableName = argument.name;
			}
		}
	}

	if (t.isObjectExpression(config)) {
		// React.createElement(type, config, children)
		return objectHasPropertyMatch(t, config);
	}
}

function objectHasPropertyMatch(t, object) {
	const properties = object.properties || [];		
	return !!properties.filter(p => propertyDoesMatch(t, p)).length;
}

function propertyDoesMatch(t, property) {
	return t.isObjectProperty(property)
		&& t.isIdentifier(property.key, { name: 'cache' })
		&& t.isBooleanLiteral(property.value, { value: true });
}

function replacePath(t, path) {
	path.replaceWith(t.callExpression(
		t.memberExpression(
			t.identifier('ReactCache'),
			t.identifier('createElement')
		),
		path.node.arguments
	));
}
