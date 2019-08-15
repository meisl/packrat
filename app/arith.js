(function (global) {
	'use strict';
	
	// grammar:
	// Additive <- Primary '+' Additive | Primary
	// Primary  <- '(' Additive ')' | Decimal
	// Decimal  <- '0' | '1' | ... | '9'


	var derivsCount = 0;
	class Derivs {
		static get count() {
			return derivsCount;
		}
		constructor(add, prim, dec, chr) {
			this.n = ++derivsCount;
			this.add = add;
			this.prim = prim;
			this.dec = dec;
			this.chr = chr;
		}
		
		get dvAdditive() {
			const res = this.add(this);
			Object.defineProperty(this, 'dvAdditive', { value: res, enumerable: true }); // memoize
			return res;
		}
		get dvPrimary() {
			const res = this.prim(this);
			Object.defineProperty(this, 'dvPrimary', { value: res, enumerable: true }); // memoize
			return res;
		}
		get dvDecimal() {
			const res = this.dec(this);
			Object.defineProperty(this, 'dvDecimal', { value: res, enumerable: true }); // memoize
			return res;
		}
		get dvChar() {
			const res = this.chr(this);
			Object.defineProperty(this, 'dvChar', { value: res, enumerable: true }); // memoize
			return res;
		}
		
	}
	
	var resultCount = 0;
	class Result {
		static get count() {
			return resultCount;
		}
		constructor (value, derivs) {
			this.n = ++resultCount;
			this.value = value;
			this.derivs = derivs;
		}
	}
	
	const NoParse = null;
	
	function parse (s) { // String -> Derivs
		//console.log(`parse(${stringify(s)})`, s);
		return new Derivs(
			parse.pAdditive,
			parse.pPrimary,
			parse.pDecimal,
			() => (s == '') ? null : new Result(s[0], parse(s.substr(1))) // chr
		);
	}
	
	parse.pAdditive = d => { // Derivs -> Result Int
		
		// const prim = d.dvPrimary;
		// if (prim) {
			// const ch = prim.derivs.dvChar;
			// if (ch && (ch.value === '+')) {
				// const add = ch.derivs.dvAdditive;
				// if (add) {
					// return new Result(prim.value + add.value, add.derivs);
				// }
			// }
		// }
		// return p;

		const primary = d.dvPrimary;
		if (primary !== NoParse) {
			const vleft = primary.value;
			const d1 = primary.derivs;
			const ch = d1.dvChar;
			if ((ch !== NoParse) && (ch.value === '+')) {
				const d2 = ch.derivs;
				const additive = d2.dvAdditive;
				if (additive !== NoParse) {
					const vright = additive.value;
					const d3 = additive.derivs;
					return new Result(vleft + vright, d3);
				}
				
			}
		}
		return primary;
	};
	
	// Primary <- Decimal | '(' Additive ')'
	parse.pPrimary = d => { // Derivs -> Result Int
		const decimal = d.dvDecimal;
		if (decimal !== NoParse) {
			return decimal;
		}
		const ch = d.dvChar;
		if ((ch !== NoParse) && (ch.value === '(')) {
			const d1 = ch.derivs;
			const additive = d1.dvAdditive;
			if (additive !== NoParse) {
				const d2 = additive.derivs;
				const ch = d2.dvChar;
				if ((ch !== NoParse) && (ch.value === ')')) {
					return new Result(additive.value, ch.derivs);
				}
			}
		}
		return NoParse;
	};
	parse.pDecimal = d => { // returns Result<Int>
		const ch = d.dvChar;
		if (ch !== NoParse) {
			const v = ch.value;
			switch (v) {
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					return new Result(+v, ch.derivs);
			}
		}
		return NoParse;
	};
	
	return global.packrat = {
		Derivs,
		Result,
		parse
	};
	
}(function() { return this; }()));
