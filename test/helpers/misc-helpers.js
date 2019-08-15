(function (global) {
	'use strict';

	const stringify = v => {
		var tv = typeof v;
		switch (tv) {
			case 'object':
				if (Array.isArray(v)) {
					return `[${v.map(stringify)}]`;
				}
				break;
			case 'string':
				return `"${v.replace('"', '\\"')}"`;
		}
		return '' + v;
	};
	
	return Object.assign(global, {
		stringify
	});

}(function() { return this; }()));


