# Testing Module
# Test running and validation

# Run tests once
run:
    vitest

# Run tests in watch mode
watch:
    vitest watch

# Run web experiment with custom vite config
experiment:
    vite --config src/apps/web-experiment/vite.config.mjs