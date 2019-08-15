(function () {
	'use strict';
	const undefined = void(0);

	const { test, skip, todo } = QUnit;
	
	QUnit.module('arith', hooks => {
		test('global ratpack object', assert => {
			assert.equal(typeof ratpack.parse, 'function');
		});
		
		const { parse, Result, Derivs } = ratpack;
		
		function assert_nullResult(assert, deriv, key, msg) {
			if (!(deriv instanceof Derivs))
				throw new TypeError('derivs is not a Derivs instance: ' + QUnit.dump.parse(deriv));
			assert.strictEqual(deriv[key], null,
				`deriv[${stringify(key)}] should be null`
				+ (msg ? ` (${msg})`: '')
			);
		}

		function assert_resultValue(assert, deriv, key, expectedValue, msg) {
			if (!(deriv instanceof Derivs))
				throw new TypeError('derivs is not a Derivs instance: ' + QUnit.dump.parse(deriv));
			
			const r = deriv[key],
				isResult = r instanceof Result,
				typeMsg = `property ${stringify(key)} should be instanceof Result`;
			if (isResult) {
				assert.ok(true, typeMsg);
			} else {
				assert.ok(false, typeMsg + `\nactually: ${QUnit.dump.parse(r)}`);
			}
			assert.strictEqual(r.value, expectedValue, `result[${stringify(key)}].value ${msg || ''}`);
		}
		
		QUnit.module('parse', hooks => {
			test('empty string', assert => {
				const d = parse('');
				assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
				assert_nullResult(assert, d, 'dvChar');
				assert_nullResult(assert, d, 'dvDecimal');
				assert_nullResult(assert, d, 'dvPrimary');
				assert_nullResult(assert, d, 'dvAdditive');
			});

			QUnit.module('non-decimal digit characters', () => {
				' ()+-*/abcd'.split('').forEach(
					s => test(`"${s}"`, assert => {
						const d = parse(s);
						assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
						
						const doAssert = assert_resultValue.bind(null, assert, d);
						doAssert('dvChar',      s, 'should have consumed first char');
						
						assert_nullResult(assert, d, 'dvDecimal');
						assert_nullResult(assert, d, 'dvPrimary');
						assert_nullResult(assert, d, 'dvAdditive');
					})
				);
			}); // end module "non-decimal digit characters"

			QUnit.module('single decimal digit', () => {
				'0123456789'.split('').forEach(
					s => test(`"${s}"`, assert => {
						const d = parse(s);
						assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
						
						const doAssert = assert_resultValue.bind(null, assert, d);
						doAssert('dvChar',      s, 'should have consumed first char');
						doAssert('dvDecimal',  +s);
						doAssert('dvPrimary',  +s);
						doAssert('dvAdditive', +s);
					})
				);
			}); // end module "single decimal digit"

			QUnit.module('two decimal digits', () => {
				['00', '01', '02', '11', '23', '37', '42'].forEach(
					s => test(`"${s}"`, assert => {
						const d = parse(s);
						assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
						
						const doAssert = assert_resultValue.bind(null, assert, d);
						doAssert('dvChar',      s[0], 'should have consumed first char');
						doAssert('dvDecimal',  +s[0]);
						doAssert('dvPrimary',  +s[0]);
						doAssert('dvAdditive', +s[0]);
					})
				);
			}); // end module "two decimal digits"

			QUnit.module('valid expressions without parens', () => {
				test('"1+1"', assert => {
					const s = "1+1";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					doAssert('dvDecimal',  +s[0]);
					doAssert('dvPrimary',  +s[0]);
					doAssert('dvAdditive', 2);
				});
				test('"9+2"', assert => {
					const s = "9+2";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					doAssert('dvDecimal',  +s[0]);
					doAssert('dvPrimary',  +s[0]);
					doAssert('dvAdditive', 11);
				});
			}); // end module "valid expressions without parens"

			QUnit.module('valid expressions with parens', () => {
				test('"(1+1)"', assert => {
					const s = "(1+1)";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					assert_nullResult(assert, d, 'dvDecimal', 'should not succeed at opening paren');
					doAssert('dvPrimary',  2, 'should consume outermost (and leftmost) parens');
					doAssert('dvAdditive', 2);
				});
				test('"(1)+2"', assert => {
					const s = "(1)+2";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					assert_nullResult(assert, d, 'dvDecimal', 'should not succeed at opening paren');
					doAssert('dvPrimary',  1, 'should consume outermost (and leftmost) parens');
					doAssert('dvAdditive', 3);
				});
				test('"1+(2)"', assert => {
					const s = "1+(2)";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					doAssert('dvDecimal',  +s[0]);
					doAssert('dvPrimary',  1, 'should consume outermost (and leftmost) parens');
					doAssert('dvAdditive', 3);
				});
			}); // end module "valid expressions with parens"

		}); // end module "parse"
	}); // end module "arith"
	

}());

