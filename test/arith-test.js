(function () {
	'use strict';
	const undefined = void(0);

	const { module, test, skip, todo } = QUnit;
	
	const { parse, Result, Derivs } = ratpack;
	
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

	
	module('arith', hooks => {
		
		var expect = function (subject) {
			const assert = expect.assert;
			if (!assert) throw new Error('expect did not find assert');
			return {
				toHaveNull: function (key, msg) {
					const mCustom   = msg ? ` (${msg})` : '';
					const mStandard = `["${key}"] should be null`;
					var mDescription = '';
					if ((typeof subject === 'object') && (subject !== null)) {
						const ctor = subject.constructor;
						if (ctor && ctor.name) {
							mDescription = `<a ${ctor.name}>`;
						}
					}
					mDescription = mDescription || '{...}';
					const v = subject[key];
					const result = v === null;
					msg = mDescription + mStandard + mCustom;
					if (!result) {
//						msg += `\nthe instance:\n${QUnit.dump.parse(subject)}`;
					}
					assert.strictEqual(v, null, msg);
				}
				
			};
		};
		
		hooks.beforeEach(assert => {
			expect.assert = assert;
		});

		hooks.afterEach(assert => {
			delete expect.assert;
		});
		
		module('parse', hooks => {
			test('empty string', assert => {
				const d = parse('');
				assert.ok(d instanceof Derivs, 'parse returns a Derivs instance: ' + d);

				expect(d).toHaveNull('dvChar');
				expect(d).toHaveNull('dvDecimal');
				expect(d).toHaveNull('dvPrimary');
				expect(d).toHaveNull('dvAdditive');
			});

			module('non-decimal digit characters', () => {
				' ()+-*/abcd'.split('').forEach(
					s => test(`"${s}"`, assert => {
						const d = parse(s);
						assert.ok(d instanceof Derivs, 'parse returns a Derivs instance: ' + d);
						
						const doAssert = assert_resultValue.bind(null, assert, d);
						doAssert('dvChar',      s, 'should have consumed first char');
						
						expect(d).toHaveNull('dvDecimal');
						expect(d).toHaveNull('dvPrimary');
						expect(d).toHaveNull('dvAdditive');
					})
				);
			}); // end module "non-decimal digit characters"

			module('single decimal digit', () => {
				'0123456789'.split('').forEach(
					s => test(`"${s}"`, assert => {
						const d = parse(s);
						assert.ok(d instanceof Derivs, 'parse returns a Derivs instance: ' + d);
						
						const doAssert = assert_resultValue.bind(null, assert, d);
						doAssert('dvChar',      s, 'should have consumed first char');
						doAssert('dvDecimal',  +s);
						doAssert('dvPrimary',  +s);
						doAssert('dvAdditive', +s);
					})
				);
			}); // end module "single decimal digit"

			module('two decimal digits', () => {
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

			module('valid expressions without parens', () => {
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

			module('valid expressions with parens', () => {
				test('"(1+1)"', assert => {
					const s = "(1+1)";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					expect(d).toHaveNull('dvDecimal', 'should not succeed at opening paren');
					doAssert('dvPrimary',  2, 'should consume outermost (and leftmost) parens');
					doAssert('dvAdditive', 2);
				});
				test('"(1)+2"', assert => {
					const s = "(1)+2";
					const d = parse(s);
					assert.ok(d instanceof Derivs, 'returns a Derivs instance: ' + d);
					
					const doAssert = assert_resultValue.bind(null, assert, d);
					doAssert('dvChar',      s[0], 'should have consumed first char');
					expect(d).toHaveNull('dvDecimal', 'should not succeed at opening paren');
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

