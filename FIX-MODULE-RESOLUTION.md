# Fix: Cannot find module '@motiadev/test'

## The Problem
The error `Cannot find module '@motiadev/test' or its corresponding type declarations` occurs because the `@motiadev/test` package hasn't been built yet. The package.json points to `dist/index.js` and `dist/index.d.ts`, but these files don't exist until the package is compiled.

## Quick Fix (Immediate Solution)

### Option 1: Build the specific package
```bash
# Navigate to the test package and build it
cd packages/test
npm run build
cd ../..

# Now run your tests
npm run test
```

### Option 2: Build all dependencies using turbo
```bash
# Build all packages (this will build in the correct order)
npm run build

# Now run your tests
npm run test
```

### Option 3: Use the dependency builder script
```bash
# Build dependencies in the correct order
npm run build:deps

# Now run your tests
npm run test
```

## Permanent Solution (Already Implemented)

The playground package now has a `pretest` script that automatically builds the required dependencies before running tests:

```json
{
  "scripts": {
    "pretest": "cd .. && turbo build --filter=@motiadev/test --filter=@motiadev/core",
    "test": "PATH=python_modules/bin:$PATH jest"
  }
}
```

This means when you run `npm run test` in the playground, it will:
1. First build `@motiadev/core` and `@motiadev/test` packages
2. Then run the Jest tests

## Why This Happens

In a monorepo with workspace dependencies:
1. `@motiadev/test` is a workspace package (not published to npm)
2. It needs to be compiled from TypeScript to JavaScript first
3. The `dist/` directory is created during the build process
4. Without the build, the import fails because there's no compiled JavaScript

## Verification

After building, you should see:
- `packages/test/dist/index.js` exists
- `packages/test/dist/index.d.ts` exists
- No more TypeScript errors in the integration tests

## Future Prevention

The turbo configuration ensures that:
- Tests depend on builds (`"dependsOn": ["^build"]`)
- Dependencies are built in the correct order
- Caching prevents unnecessary rebuilds

So running `npm run test` at the root level will automatically build dependencies first.