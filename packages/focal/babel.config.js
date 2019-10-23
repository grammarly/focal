module.exports = {
    presets: ['@babel/preset-env'],
    plugins: [
      ['transform-imports', {

        'rxjs': {
          transform: importName => {
            switch (importName) {
              // These can't be supported because not only are they different paths they
              // require different import names too. e.g.
              //
              // before:
              //   import { asapScheduler } from 'rxjs'
              // after:
              //   import { asap } from 'rxjs/internal/scheduler/asap'
              //
              case 'asapScheduler':
              case 'asyncScheduler':
              case 'queueScheduler':
              case 'animationFrameScheduler':
                throw new Error(`Schedulers like ${importName} are not supported by this babel plugin demo`);
          
              default: {
                try {
                  const path = `rxjs/internal/${importName}`;
                  require.resolve(path);
                  return path;
                } catch (_) {}
          
                try {
                  const path = `rxjs/internal/observable/${importName}`;
                  require.resolve(path);
                  return path;
                } catch (_) {}
          
                try {
                  const path = `rxjs/internal/scheduler/${importName}`;
                  require.resolve(path);
                  return path;
                } catch (_) {}
          
                throw new Error(`import { ${importName} } from 'rxjs' was not able to be transformed correctly as the original file wasn't in the two typical locations`);
              }
            }
          },
          preventFullImport: true,
          skipDefaultConversion: true
        },
        
        'rxjs/operators': {
          transform: 'rxjs/internal/operators/${member}',
          preventFullImport: true,
          skipDefaultConversion: true
        }
      }]
    ]
}

