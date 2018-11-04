# <a href="http://github.com/grammarly/focal"><img src="https://raw.githubusercontent.com/grammarly/focal/master/logo/logo.png" alt="Focal 🔍" height="100"></a>

[![Build Status](https://travis-ci.org/grammarly/focal.svg?branch=master)](https://travis-ci.org/grammarly/focal) [![npm version](https://img.shields.io/npm/v/@grammarly/focal.svg)](https://www.npmjs.com/package/@grammarly/focal) [![Apache 2.0 license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/grammarly/focal#license)

Type safe, expressive and composable state management for [React](https://facebook.github.io/react/) applications.

- Represent the whole application state as an immutable and [observable](http://reactivex.io/) single source of truth.
- Seamlessly embed observables into React components' layout.
- Leverage the power of [Rx.JS](http://reactivex.io/) (and observables in general) to enrich and combine parts of application state, explicitly controlling the data flow.
- Use [lenses](https://en.wikibooks.org/wiki/Haskell/Lenses_and_functional_references) to decompose the application state into smaller parts, so you can isolate UI components in a clean way and manipulate application state effortlessly.
- Write less code that is easier to understand.

# Example

Here's a typical example of a 'counter' UI component and how it fits within the whole application:

```typescript
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  Atom,
  // this is the special namespace with React components that accept
  // observable values in their props
  F
} from '@grammarly/focal'

// our counter UI component
const Counter = (props: { count: Atom<number> }) =>
  <F.div>
    {/* use observable state directly in JSX */}
    You have clicked this button {props.count} time(s).

    <button
      onClick={() =>
        // update the counter state on click
        props.count.modify(x => x + 1)
      }
    >
      Click again?
    </button>
  </F.div>

// the main 'app' UI component
const App = (props: { state: Atom<{ count: number }> }) =>
  <div>
    Hello, world!
    <Counter
      count={
        // take the app state and lens into its part where the
        // counter's state lies.
        //
        // this creates an atom which you can write to, in a type safe way.
        props.state.lens('count')
      }
    />
  </div>

// create the app state atom
const state = Atom.create({ count: 0 })

// track any changes to the app's state and log them to console
state.subscribe(x => {
  console.log(`New app state: ${JSON.stringify(x)}`)
})

// render the app
ReactDOM.render(
  <App state={state} />,
  document.getElementById('app')
)
```

You can play with this example online [on CodeSandbox](https://codesandbox.io/s/52l109yowl).

There's also a more elaborate version of [this example](packages/examples/all/src/counter/index.tsx), as well as some other examples, in the [examples directory](packages/examples).

# Installation

```bash
yarn add @grammarly/focal
```

or

```bash
npm install --save @grammarly/focal
```

It is important to satisfy the RxJS peer dependency (required for `instanceof Observable` tests to work correctly).

Also note, that for `npm`-based packages you will need npm 3.x. For Focal to work properly, you need to:

- have the same version of RxJS installed in your package (listed as a peer dependency in Focal)
- have RxJS installed in an npm 3.x way so that it is not duplicated in your app's node_modules and Focal's node_modules

# Tutorial

The example above might be a bit too overwhelming. Let's go over the main concepts bit by bit.

## Reactive variables

In Focal, state is stored in `Atom<T>`s. `Atom<T>` is a data cell that holds a single immutable value, which you can read and write to:

```typescript
import { Atom } from '@grammarly/focal'

// create an Atom<number> with initial value of 0
const count = Atom.create(0)

// output the current value
console.log(count.get())
// => 0

// set 5 as the new value
count.set(5)

console.log(count.get())
// => 5

// modify the value: set a new value which is based on current value
count.modify(x => x + 1)

console.log(count.get())
// => 6
```

You can also track (get notified of) changes that happen to an `Atom<T>`'s value. In this sense, an `Atom<T>` can be thought of as a _reactive variable_:

```typescript
import { Atom } from '@grammarly/focal'

const count = Atom.create(0)

// subscribe to changes of count's value, outputting a new value to the
// console each time
// NOTE how this will immediately output the current value
count.subscribe(x => {
  console.log(x)
})
// => 0

console.log(count.get())
// => 0

// set a new value – it will get written to the console output
count.set(5)
// => 5

count.modify(x => x + 1)
// => 6
```

## Atom properties

Every atom is expected to satisfy these properties:

1. When `.subscribe`d to, emit the current value immediately.
2. Don't emit a value if it is equal to the current value.

## Single source of truth

`Atom<T>`s are used as a source of application state in Focal. There are more than one way in which you can create an `Atom<T>`, with `Atom.create` being the one that you use to create the application state root. Ideally, we want for the application state to come from a single source of truth. (We will talk about managing application state in this fashion below).

Although you can create as many `Atom<T>`s through `Atom.create` as you need, it generally should be avoided. The problem with having several (or many) sources of application state is that you may end up with different sorts of dependencies between these state sources, and there is no way to update several `Atom<T>`s at the same time. This can lead to inconsistency between the parts of your application state.

## Data binding

We have learned how to create, change and track application state. Now, for it to be useful in a React user interface, we need a way to display this data.

Focal allows you to directly embed `Atom<T>`s in JSX code. In practice, this works similar to data binding in frameworks like Angular. There are differences, though:

- In Focal, you use regular code (TypeScript or JavaScript), and not a template engine syntax (like in Vue.js), to describe your data. There's no magic happening at the syntax level, so you can use all the standard language tools that you already have.
- Since Focal data bindings are ordinary TypeScript (or JavaScript) expressions, you can continue using the same IDE features like autocompletion, go to definition, rename refactoring, find usages, etc. This makes UI layout code maintenance easier compared to a template engine.
- You can also take advantage of your existing static analysis tools (e.g. the type checking of TypeScript compiler). This way, your UI code can be just as reliable as any other code.
- The change of data (an `Atom<T>`) triggers component render, and not the other way around (e.g. when component render triggers data evaluation). You also usually don't think about when a component should get rendered – this is handled automatically.

Let's see what it looks like in code:

```typescript
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { F, Atom } from '@grammarly/focal'

// create our state
const count = Atom.create(0)

// define a stateless React component that will take
// an Atom<number> in its props
const Counter = (props: { count: Atom<number> }) =>
  <F.div>
    {/* embed the state atom directly in JSX */}
    Count: {count}
  </F.div>

// mount the component onto DOM
ReactDOM.render(
  <Counter count={count} />,
  document.getElementById('test')
)

// => <div>Count: 0</div>
```

How is this different from regular React?

Instead of using a `<div />`, we used an `<F.div />`. In React, you can already embed code in JSX, but it's mostly restricted to things that can be converted to a string and other React elements.

`F`-components are different. `F` is a namespace of the so-called lifted components that mirror React's intrinsic components, but which can also accept `Atom<T>`s (additionally to what React already allows) in their props.

Recall that a React JSX element child content gets interpreted as the `children` prop, so this means that Focal also supports embedding `Atom<T>`s in component child content – that's what we did.

Now let's get the application state to update:

```typescript
// This line below will modify the current value of the `count` atom,
// which we used in the `Counter` component. Modifying the state which was
// used in a component will make the component update:
count.set(5)

// => <div>Count: 5</div>
```

You may have noticed that we didn't update any React component state, yet the `<Counter />` component somehow has new content now. In fact, as far as React is concerned, neither props nor state of the `<Counter />` component have changed, so this component is not rendered when the counter state is changed.

This content update is handled in the `<F.div />` component, which is also true for all lifted (a.k.a. `F`) components. An `F`-component will `.subscribe` to all of its `Atom<T>` props and render every time a prop value has changed.

So technically, while the `<Counter />` is not rendered when the `count`'s value is changed, its child `<F.div />` _is_ rendered.

Now let's make our counter component a bit more complex:

```typescript
// a spiced up version of the counter component
const Counter = (props: { count: Atom<number> }) =>
  <F.div>
    Count: {count}.
    {/* say whether the count number is odd or even */}
    That's an {count.view(x => x % 2 === 0 ? 'even' : 'odd')} number!
  </F.div>

// => <div>Count: 5. That's an odd number!</div>
```

We've added this `That's an odd number!` line (which will also say `even` for even numbers) by creating a _view_ of our state atom.

To create a view means to create an atom which shows its state in a modified way that is defined by the view function. It's not a lot different than `map`ping over an [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) or an [observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-map), actually. The main difference is that just like the source atom, the derived atom (a view) will only emit a new value if it is not equal to the current value.

Let's try one more thing:

```typescript
const Counter = (props: { count: Atom<number> }) =>
  <F.div
    style={{
      // make the background progressively more red as the count number increases
      'background-color': count.view(x => `rgba(255, 0, 0, ${Math.min(16 * x, 255)})`)
    }}
  >
    Count: {count}.
    That's an {count.view(x => x % 2 === 0 ? 'even' : 'odd')} number!
  </F.div>

// => <div style="{'background-color': 'rgba(255, 0, 0, 80)'}">Count: 5. That's an odd number!</div>
```

Here, we used our state atom to create a _dynamic style_ for our component. So, as you can see, you can use atoms almost anywhere with `F`-components, which makes it easy to make your UI dependent on state in a declarative way.

## Composition

We have learned how to declaratively create UI layouts that depend on application state. Now, to make a bigger and more complex application with these tools, and keep this application from falling apart, we need two things:

1. Have the application state come from a single place (a single atom), so that when different parts of the application interact with each other, these interactions can't fall out of sync with each other and the application state is consistent as a whole.
2. Split the application state into parts so that we can create our app layout from small UI components that don't have to know about the whole application state.

These two requirements may look mutually exclusive at first, and here's when lenses finally come into play.

## Lens

A quick refresher on what a lens is:

- an abstraction to read and write a _part_ of _immutable_ data
- a combination of a getter and a setter function

In TypeScript, a lens can be expressed as this generic interface:

```typescript
interface Lens<TSource, T> {
  get(source: TSource): T
  set(newValue: T, source: TSource): TSource
}
```

And an example usage:

```typescript
import { Lens } from '@grammarly/focal'

// an object that we want to operate on
const obj = {
  a: 5
}

// our example lens that looks at the object's `a` property
const a = Lens.create(
  // provide the getter: returns the `a` property
  (obj: { a: number }) => obj.a,
  // and the setter: returns a new object with the `a` property updated to a new value
  (newValue, obj) => ({ ...obj, a: newValue })
)

// read through the lens
console.log(a.get(obj))
// => 5

// write through the lens
console.log(a.set(6, obj))
// => { a: 6 }
```

Note how we get a fresh object back when we use the `.set` method: as we're working without mutations, we create a new object when we want to `.set` some part of it through a lens.

This doesn't look very useful yet, though. After all, why don't we just do `obj.a` and `{ ...obj, a: 6 }` every time we need to?

But imagine that your object is lot more complex than that (e.g. `{ a: { b: { c: 5 } } }`), and that it's just a part of some even bigger object:

```typescript
const bigobj = {
  one: { a: { b: { c: 5 } } },
  two: { a: { b: { c: 6 } } }
}
```

One powerful feature of lenses is that they can be composed (chained together). Assume you have defined a lens to drill down to the `c` property of the `{ a: { b: { c: 5 } } }` object. Now you can reuse that to work on both (`one` and `two`) parts of the `bigobj` object:

```typescript
// a lens that is focused on a deeply nested property `c` of an `{ a: { b: { c: 5 } } }` object
const abc: Lens<...> = ...

// a lens that looks at the `one` part of `bigobj`
const one: Lens<typeof bigobj, ...> = ...

// a lens that looks at the `two` part of `bigobj`
const two: Lens<typeof bigobj, ...> = ...

// compose `one` and `two` with `abc` so we can work on `c` of `{ one: { a: { b: { c: 5 } } } }`
// and `{ two: { a: { b: { c: 5 } } } }`
const oneC = one.compose(abc)
const twoC = two.compose(abc)

console.log(oneC.get(bigobj))
// => 5

console.log(twoC.get(bigobj))
// => 6

console.log(oneC.set(7, bigobj))
// => { one: { a: { b: { c: 7 } } }, two: { a: { b: { c: 6 } } } }
```

Focal also gives you the ability to define these lenses quite conveniently:

```typescript
// create the above lenses by ONLY providing a getter function¹
const abc = Lens.prop((obj: typeof bigobj.one) => obj.a.b.c)

const one = Lens.prop((obj: typeof bigobj) => obj.one)

const two = Lens.prop((obj: typeof bigobj) => obj.two)

// ¹ RESTRICTIONS APPLY! the getter function in this case can only be a simple
// property path access function which consists of a single property access expression
// and has no side effects.
```

The best part about this is that it is completely type safe, and all of the IDE tools (like auto-completion, refactoring, etc.) will just work.

It may seem strange that we only provide the getter function when a lens should be able to also set the focused value. And it is strange indeed – this is a place where we have a bit of magic going on. But this should only be regarded as an implementation detail, as with advances in the TypeScript compiler it may become obsolete in the future.

_For a quick explanation, we use a similar trick that was (and probably is) a standard practice in WPF to implement a [type safe `INotifyPropertyChanged` interface](https://mfelicio.com/2010/01/10/safe-usage-of-inotifypropertychanged-in-mvvm-scenarios/). We convert the getter function to a string (by calling `.toString()`) and then parse the property access path from the function's source code. It's a hacky way to do this and has a lot of obvious limitations, but it helps a lot._

## More about lenses

Hopefully, the section above can give you some feeling of the power of lenses, as there is a lot more you can do with this abstraction. It would not be possible to cover all of the interesting parts in this short tutorial, though.

Unfortunately, most articles and tutorials on lenses are written in context of the [Haskell](https://www.haskell.org/) programming language. This is because lenses are most explored in Haskell. However, they are also used in quite a number of other languages, including Scala, F#, OCaml, PureScript, Elm and probably many others.

- [Program imperatively using Haskell lenses](http://www.haskellforall.com/2013/05/program-imperatively-using-haskell.html)
- [WikiBooks article on Haskell lenses](https://en.wikibooks.org/wiki/Haskell/Lenses_and_functional_references)
- [School of Haskell lens tutorial](https://www.schoolofhaskell.com/school/to-infinity-and-beyond/pick-of-the-week/a-little-lens-starter-tutorial)
- [lens over tea blog series](https://artyom.me/lens-over-tea-1)

## Atoms and lenses

Okay, let's get back on track. So far we have learned how to work with application state and embed it in our UI layout code.

We have also learned how to abstract operations on immutable data, to conveniently operate on parts of large immutable objects. And this is exactly what we will need to split our application's state into parts. We want to build our application in a way so that each UI component can work with only relevant parts of the whole application state.

We can accomplish this by combining atoms with lenses, making _lensed atoms_.

A lensed atom is just an `Atom<T>`, in sense that on the outside it looks and behaves just like another atom. The difference is in how it is created: a lensed atom operates on a part of some other atom's state. This means that if you `.set` or `.modify` a lensed atom's value, the part of the source atom's value at which this lensed atom's lens is focused will also change. For example:

```typescript
import { Atom, Lens } from '@grammarly/focal'

// create an atom to hold our object
const obj = Atom.create({
  a: 5
})

// create a lens to look at an `a` property of the object
const a = Lens.prop((x: typeof obj) => x.a)

// create a lensed atom that will hold a value of the `a` property of our object
const lensed = obj.lens(a)

console.log(obj.get())
// => { a: 5 }

console.log(lensed.get())
// => 5

// set a new value to the lensed atom
lensed.set(6)

console.log(obj.get())
// => { a: 6 }
```

Note how the source atom's value has changed when we set a new value to the lensed atom – that's it. There's also a neat shortcut to create lensed atoms:

```typescript
const lensed = obj.lens(x => x.a) // ¹

// ¹ SAME RESTRICTIONS APPLY! just like with Lens.prop, the getter function argument
// to the atom's `lens` method can only be a simple property path access function which
// consists of a single property access expression and has no side effects.
```

We don't need to explicitly create a `Lens` – atom's `lens` method already has a couple of overloads to create lensed atoms on the spot. Also note that we didn't need to add the `typeof obj` type annotation here: the compiler already knows the type of data we're operating on (from the type of `obj`, which in this case is `Atom<{ a: number }`) and can infer the type of `x` for us.

Armed with this, it should now be possible for us to decompose the single-source-of-truth state atom of our application into small parts, suitable to be used in individual UI components. Let's try this with our counter example from above:

```typescript
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom, F } from '@grammarly/focal'

// application state
const state = Atom.create({
  count: 0
})

// the counter component from before
const Counter = (props: { count: Atom<number> }) =>
  <F.div>
    Count: {props.count}.

    <button onClick={() => props.count.modify(x => x + 1)}>
      Click again!
    </button>
  </F.div>

// the app component which takes the whole app state from the
// `state` prop
const App = (props: { state: Atom<{ count: number }> }) =>
  <div>
    Hi, here's a counter:

    {/*
      this is where we take apart the app state and give only a part of it
      to the counter component:
    */}
    <Counter count={props.state.lens(x => x.count)} />
  </div>
```

And this concludes our tutorial on Focal basics!

Hopefully, it is now more clear how all of this comes together. Please also make sure to check out some of the [other examples](packages/examples) – build them and play around to get a better feel for what you can do.

# Framework?

Focal is not a framework, in the sense that you are not restricted to a particular way of writing your whole application. Focal has an imperative interface (remember that you can use the `.set` and `.modify` methods of atom) and can play nicely with React components of any nature. This means that using Focal is optional within different parts of the same application.

# Performance

Although we've yet to establish a comprehensive set of benchmarks, so far Focal has shown performance at least on par with plain React on examples such as TodoMVC.

Generally, when an `Atom<T>`/`Observable<T>` that was embedded into a React component emits a new value, only relevant parts of the component are updated. This means that if you have a complex React component with an actively changing value somewhere deep inside its visual tree, only that part will get updated, not the whole component. In many cases, this can make it a lot easier to optimize for VDOM re-computations.

# Commercial uses

We used Focal at [Grammarly](https://www.grammarly.com/) to build our [online writing app](https://app.grammarly.com/).

![Grammarly logo](https://d1zw7v9lpbbx9f.cloudfront.net/static/files/997ea3a3690bda688b2a6d7407bb5eb9/logo.svg)

# JavaScript support

Although technically it should be possible to use Focal in a JavaScript project, we haven't tried that yet. So please feel free to open any issues you might have with this kind of setup.

# Prior art

Focal started as a TypeScript port of [Calmm](https://github.com/calmm-js/), but along the way we ended up with some significant differences.

From the start, we focused more on immediate developer productivity and type safety. Because of this, many things were simplified, as it was either hard to make the types work out nicely at the time (TypeScript 1.8) or difficult to make the APIs intuitive and easy to use for people familiar with React but new to functional programming.

### Differences from Calmm

- Calmm is modular in terms of consisting of several independent libraries. We didn't have the need for the modularity since we only had a single use case, so we keep everything together under a single library.
- Calmm originally makes heavy use of [Ramda](http://ramdajs.com/), currying and partially applying things here and there. This was hard to type right, so we decided to drop this practice. Although I think today it is probably easier, with advancements in the TypeScript compiler, so maybe this could be an interesting topic to explore.
- Calmm was also originally using Ramda's representation of lens, which is the [van Laarhoven representation](http://www.twanvl.nl/blog/haskell/cps-functional-references). Instead, we opted for a naїve approach of representing lens with a getter/setter pair. This has worked fine for us so far, since we haven't needed to do any traversals or polymorphic updates yet. Perhaps we should reconsider this once again some time.
- The main Calmm implementation ([kefir.atom](https://github.com/calmm-js/kefir.atom) and [kefir.react.html](https://github.com/calmm-js/kefir.react.html)) was based on [Kefir](http://rpominov.github.io/kefir/) observables. We started with Kefir as well, but soon enough migrated to [RxJS 5.x](https://github.com/ReactiveX/rxjs). The main reason was that RxJS was more fully featured and supported some operations on observables that Kefir didn't.

# License

Copyright 2017 Grammarly, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
