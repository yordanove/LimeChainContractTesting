# Store Contract Testing Suite

A comprehensive testing suite for an Ethereum Store Contract using Hardhat, implementing Page Object Model pattern and achieving high test coverage.

## Overview

This project implements a testing framework for a Store Contract with the following features:
- Product management by administrator
- Product purchasing by clients
- Refund functionality with time constraints
- Quantity tracking and validation

## Test Coverage

Current coverage metrics:
- Store.sol: 96.67% (with one known unreachable branch)
- StoreBase.sol: 100%
- Complete function coverage
- Full line coverage

## Project Structure

```
├── contracts/           # Solidity contract files
├── test/
│   ├── constants/      # Test constants and error messages
│   ├── factories/      # Test data factories
│   ├── helpers/        # Test helper functions
│   ├── pages/          # Page Object Model implementations
│   └── tests/          # Test suites by domain
├── .github/workflows/   # CI configuration
└── hardhat.config.js   # Hardhat configuration
```

## Test Organization

Tests are organized by domain:
1. Product Management
    - Product addition and updates
    - Owner access control
    - Name and quantity validation

2. Product Purchasing
    - Multi-buyer scenarios
    - Quantity tracking
    - Purchase restrictions

3. Refund Policy
    - Time-based refunds
    - Multiple refund scenarios
    - Policy updates

4. Edge Cases
    - Boundary conditions
    - Error states
    - State consistency

## Setup and Execution

1. Install dependencies:
```bash
npm install
```

2. Run local node (in a separate terminal):
```bash
npx hardhat node
```

3. Run tests:
```bash
npx hardhat test
```

4. Generate coverage report:
```bash
npx hardhat coverage
```

Note: Coverage report will be generated in the `coverage/` directory.

## CI/CD

Implemented GitHub Actions workflow that:
- Compiles contracts
- Deploys to local node
- Runs test suite
- Verifies coverage
- Reports results

## Implementation Highlights

1. Page Object Model
    - Abstracted contract interactions
    - Improved test maintainability
    - Clear separation of concerns

2. Test Data Management
    - Organized test constants
    - Factory pattern for test data
    - Consistent error messages

3. Coverage Strategy
    - Integration-style testing
    - Complete path coverage
    - Documented edge cases

## Known Limitations

- One unreachable branch in Store.sol (96.67% coverage) due to modifier chain compilation
- Coverage reporting limitations with parallel test execution

## Future Improvements

1. Technical Enhancements
    - Implement parallel test execution
    - Gas optimization analysis

2. Testing Improvements
    - Performance testing
    - Fuzzing/Property-based testing
    - Extended edge case coverage

3. CI/CD Enhancements
    - Cross-platform testing
    - Automated documentation generation
    - Gas usage reporting

## Tools and Technologies

- Hardhat
- Mocha/Chai
- Solidity Coverage
- GitHub Actions
- OpenZeppelin Contracts
