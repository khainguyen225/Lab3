'use strict';

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

// Calculator state
let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetDisplay = false;
let justCalculated = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

function updateDisplay(value, expr = '') {
    // Trim long numbers to avoid overflow
    const formatted = formatNumber(value);
    resultEl.textContent = formatted;
    expressionEl.textContent = expr;
}

function formatNumber(value) {
    if (value === 'Error') return 'Error';
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Limit to 10 significant digits
    const str = parseFloat(num.toPrecision(10)).toString();
    return str;
}

function operatorSymbol(op) {
    const map = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    return map[op] || op;
}

// ── Core logic ────────────────────────────────────────────────────────────────

function calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
        case 'add': return numA + numB;
        case 'subtract': return numA - numB;
        case 'multiply': return numA * numB;
        case 'divide':
            if (numB === 0) return 'Error';
            return numA / numB;
        default: return numB;
    }
}

function handleNumber(value) {
    if (shouldResetDisplay || justCalculated) {
        currentValue = value;
        shouldResetDisplay = false;
        justCalculated = false;
    } else {
        // Prevent multiple leading zeros
        if (currentValue === '0' && value !== '.') {
            currentValue = value;
        } else {
            if (currentValue.length >= 12) return; // max digits
            currentValue += value;
        }
    }
    updateDisplay(currentValue, buildExpression());
}

function handleDecimal() {
    if (shouldResetDisplay || justCalculated) {
        currentValue = '0.';
        shouldResetDisplay = false;
        justCalculated = false;
    } else if (!currentValue.includes('.')) {
        currentValue += '.';
    }
    updateDisplay(currentValue, buildExpression());
}

function handleOperator(op) {
    if (operator && !shouldResetDisplay && !justCalculated) {
        // Chain calculation
        const result = calculate(previousValue, currentValue, operator);
        if (result === 'Error') {
            resetAll();
            updateDisplay('Error');
            return;
        }
        previousValue = String(parseFloat(result.toPrecision(10)));
        currentValue = previousValue;
    } else {
        previousValue = currentValue;
    }

    operator = op;
    shouldResetDisplay = true;
    justCalculated = false;
    updateDisplay(currentValue, buildExpression(true));
}

function handleEquals() {
    if (!operator || !previousValue) return;

    const expr = `${previousValue} ${operatorSymbol(operator)} ${currentValue} =`;
    const result = calculate(previousValue, currentValue, operator);

    if (result === 'Error') {
        resetAll();
        updateDisplay('Error', expr);
        return;
    }

    const resultStr = String(parseFloat(result.toPrecision(10)));
    currentValue = resultStr;
    previousValue = '';
    operator = null;
    justCalculated = true;
    shouldResetDisplay = false;
    updateDisplay(resultStr, expr);
}

function handleSign() {
    if (currentValue === '0' || currentValue === 'Error') return;
    currentValue = currentValue.startsWith('-')
        ? currentValue.slice(1)
        : '-' + currentValue;
    updateDisplay(currentValue, buildExpression());
}

function handlePercent() {
    if (currentValue === 'Error') return;
    const num = parseFloat(currentValue) / 100;
    currentValue = String(parseFloat(num.toPrecision(10)));
    updateDisplay(currentValue, buildExpression());
}

function resetAll() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetDisplay = false;
    justCalculated = false;
    updateDisplay('0', '');
}

function buildExpression(withOperator = false) {
    if (!previousValue) return '';
    if (withOperator && operator) {
        return `${previousValue} ${operatorSymbol(operator)}`;
    }
    if (operator) {
        return `${previousValue} ${operatorSymbol(operator)} ${currentValue}`;
    }
    return '';
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById('clear').addEventListener('click', resetAll);

document.querySelectorAll('.btn-number').forEach(btn => {
    const value = btn.dataset.value;
    const action = btn.dataset.action;
    btn.addEventListener('click', () => {
        if (action === 'decimal') {
            handleDecimal();
        } else {
            handleNumber(value);
        }
    });
});

document.querySelectorAll('.btn-operator').forEach(btn => {
    const action = btn.dataset.action;
    btn.addEventListener('click', () => {
        if (action === 'sign') handleSign();
        else if (action === 'percent') handlePercent();
        else handleOperator(action);
    });
});

document.querySelector('.btn-equals').addEventListener('click', handleEquals);

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
    else if (e.key === '.') handleDecimal();
    else if (e.key === '+') handleOperator('add');
    else if (e.key === '-') handleOperator('subtract');
    else if (e.key === '*') handleOperator('multiply');
    else if (e.key === '/') { e.preventDefault(); handleOperator('divide'); }
    else if (e.key === 'Enter' || e.key === '=') handleEquals();
    else if (e.key === 'Backspace') {
        if (currentValue.length > 1) {
            currentValue = currentValue.slice(0, -1);
        } else {
            currentValue = '0';
        }
        updateDisplay(currentValue, buildExpression());
    }
    else if (e.key === 'Escape') resetAll();
    else if (e.key === '%') handlePercent();
});
