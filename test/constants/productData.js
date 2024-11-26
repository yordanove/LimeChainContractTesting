const QUANTITIES = {
    DEFAULT: 5,
    PURCHASE_DEFAULT: 3,
    ZERO: 0,
    LOW: 2,
    HIGH: 10,
    MAX_UINT16: 65535,
    BULK: 10
};

const REFUND_POLICY = {
    DEFAULT: 100,
    SHORT: 10,
    MEDIUM: 50,
    LONG: 200,
    MIN: 1,
    MAX: 255
};

const BLOCKS = {
    WITHIN_REFUND: 25,
    AFTER_REFUND: 101,
    SAFETY_MARGIN: 5
};

module.exports = {
    QUANTITIES,
    REFUND_POLICY,
    BLOCKS
};
