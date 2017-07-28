import * as test from 'tape'
import * as _Json from '../src/lens/json'

test('json', t => {
  t.test('wallaby.js', t => {
    delete require.cache[require.resolve('../src/lens/json')]

    process.env.FOCAL_PROP_EXPR_RE = [
      '^', 'function', '\\(', '[^), ]+', '\\)', '\\{',
        '("use strict";)?',
        '(\\$_\\$wf\\(\\d+\\);)?',  // wallaby.js code coverage compatability (#36)
        'return\\s',
          '(\\$_\\$w\\(\\d+, \\d+\\),\\s)?',  // wallaby.js code coverage compatability (#36)
          '[^\\.]+\\.(\\S+?);?',
      '\\}', '$'
    ].join('\\s*')
    process.env.FOCAL_PROP_EXPR_RE_GROUP = 4

    const Json = require('../src/lens/json') as typeof _Json

    t.deepEqual(Json.parsePropertyPath(
      'function (x) { $_$wf(21); return $_$w(124, 53), x.a; }'), ['a'])

    t.throws(() => Json.parsePropertyPath(
      'function (x) { $_$wf(21); return x.a, $_$w(124, 53); }'))

    delete require.cache[require.resolve('../src/lens/json')]

    t.end()
  })

  t.end()
})
