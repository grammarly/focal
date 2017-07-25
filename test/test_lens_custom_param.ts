import * as test from 'tape'
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

import * as Json from '../src/lens/json'

test('json', t => {
  t.test('wallaby.js', t => {
    t.deepEqual(Json.parsePropertyPath(
      'function (x) { $_$wf(21); return $_$w(124, 53), x.a; }'), ['a'])

    t.throws(() => Json.parsePropertyPath(
      'function (x) { $_$wf(21); return x.a, $_$w(124, 53); }'))

    t.end()
  })

  t.end()
})

delete require.cache[require.resolve('../src/lens/json')]
