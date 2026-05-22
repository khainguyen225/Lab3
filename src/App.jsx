import { useEffect, useState } from 'react';

const initialState = {
  currentValue: '0',
  previousValue: '',
  operator: null,
  shouldResetDisplay: false,
  justCalculated: false,
  expression: ''
};

const operatorSymbols = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷'
};

function formatNumber(value) {
  if (value === 'Error') return 'Error';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value;

  return parseFloat(num.toPrecision(10)).toString();
}

function buildExpression(state, withOperator = false) {
  const { previousValue, operator, currentValue } = state;
  if (!previousValue) return '';
  if (withOperator && operator) {
    return `${previousValue} ${operatorSymbols[operator] || operator}`;
  }
  if (operator) {
    return `${previousValue} ${operatorSymbols[operator] || operator} ${currentValue}`;
  }
  return '';
}

function calculate(a, b, op) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  switch (op) {
    case 'add':
      return numA + numB;
    case 'subtract':
      return numA - numB;
    case 'multiply':
      return numA * numB;
    case 'divide':
      if (numB === 0) return 'Error';
      return numA / numB;
    default:
      return numB;
  }
}

export default function App() {
  const [state, setState] = useState(initialState);

  const updateDisplay = (nextState, withOperator = false) => {
    return {
      ...nextState,
      expression: buildExpression(nextState, withOperator)
    };
  };

  const handleNumber = (value) => {
    setState((prev) => {
      let { currentValue, shouldResetDisplay, justCalculated } = prev;

      if (shouldResetDisplay || justCalculated) {
        currentValue = value;
        shouldResetDisplay = false;
        justCalculated = false;
      } else {
        if (currentValue === '0' && value !== '.') {
          currentValue = value;
        } else {
          if (currentValue.length >= 12) return prev;
          currentValue += value;
        }
      }

      return updateDisplay({
        ...prev,
        currentValue,
        shouldResetDisplay,
        justCalculated
      });
    });
  };

  const handleDecimal = () => {
    setState((prev) => {
      let { currentValue, shouldResetDisplay, justCalculated } = prev;

      if (shouldResetDisplay || justCalculated) {
        currentValue = '0.';
        shouldResetDisplay = false;
        justCalculated = false;
      } else if (!currentValue.includes('.')) {
        currentValue += '.';
      }

      return updateDisplay({
        ...prev,
        currentValue,
        shouldResetDisplay,
        justCalculated
      });
    });
  };

  const handleOperator = (op) => {
    setState((prev) => {
      let { currentValue, previousValue, operator, shouldResetDisplay, justCalculated } = prev;

      if (operator && !shouldResetDisplay && !justCalculated) {
        const result = calculate(previousValue, currentValue, operator);
        if (result === 'Error') {
          return { ...initialState, currentValue: 'Error' };
        }
        previousValue = String(parseFloat(result.toPrecision(10)));
        currentValue = previousValue;
      } else {
        previousValue = currentValue;
      }

      operator = op;
      shouldResetDisplay = true;
      justCalculated = false;

      return updateDisplay({
        ...prev,
        currentValue,
        previousValue,
        operator,
        shouldResetDisplay,
        justCalculated
      }, true);
    });
  };

  const handleEquals = () => {
    setState((prev) => {
      const { operator, previousValue, currentValue } = prev;
      if (!operator || !previousValue) return prev;

      const expression = `${previousValue} ${operatorSymbols[operator] || operator} ${currentValue} =`;
      const result = calculate(previousValue, currentValue, operator);

      if (result === 'Error') {
        return { ...initialState, currentValue: 'Error', expression };
      }

      const resultStr = String(parseFloat(result.toPrecision(10)));

      return {
        ...prev,
        currentValue: resultStr,
        previousValue: '',
        operator: null,
        justCalculated: true,
        shouldResetDisplay: false,
        expression
      };
    });
  };

  const handleSign = () => {
    setState((prev) => {
      if (prev.currentValue === '0' || prev.currentValue === 'Error') return prev;

      const currentValue = prev.currentValue.startsWith('-')
        ? prev.currentValue.slice(1)
        : `-${prev.currentValue}`;

      return updateDisplay({
        ...prev,
        currentValue
      });
    });
  };

  const handlePercent = () => {
    setState((prev) => {
      if (prev.currentValue === 'Error') return prev;
      const num = parseFloat(prev.currentValue) / 100;
      const currentValue = String(parseFloat(num.toPrecision(10)));

      return updateDisplay({
        ...prev,
        currentValue
      });
    });
  };

  const handleBackspace = () => {
    setState((prev) => {
      if (prev.currentValue === 'Error') return prev;

      let currentValue = prev.currentValue;
      if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
      } else {
        currentValue = '0';
      }

      return updateDisplay({
        ...prev,
        currentValue
      });
    });
  };

  const resetAll = () => {
    setState(initialState);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      else if (e.key === '.') handleDecimal();
      else if (e.key === '+') handleOperator('add');
      else if (e.key === '-') handleOperator('subtract');
      else if (e.key === '*') handleOperator('multiply');
      else if (e.key === '/') {
        e.preventDefault();
        handleOperator('divide');
      } else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') resetAll();
      else if (e.key === '%') handlePercent();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  return (
    <div className="calculator">
      <div className="subtitle">This is a calculator</div>
      <div className="display">
        <div className="expression" id="expression">
          {state.expression}
        </div>
        <div className="result" id="result">
          {formatNumber(state.currentValue)}
        </div>
      </div>
      <div className="buttons">
        <button className="btn btn-clear span-two" onClick={resetAll}>
          AC
        </button>
        <button className="btn btn-operator" onClick={handleSign}>
          +/-
        </button>
        <button className="btn btn-operator" onClick={handlePercent}>
          %
        </button>
        <button className="btn btn-operator btn-highlight" onClick={() => handleOperator('divide')}>
          ÷
        </button>

        <button className="btn btn-number" onClick={() => handleNumber('7')}>
          7
        </button>
        <button className="btn btn-number" onClick={() => handleNumber('8')}>
          8
        </button>
        <button className="btn btn-number" onClick={() => handleNumber('9')}>
          9
        </button>
        <button className="btn btn-operator btn-highlight" onClick={() => handleOperator('multiply')}>
          ×
        </button>

        <button className="btn btn-number" onClick={() => handleNumber('4')}>
          4
        </button>
        <button className="btn btn-number" onClick={() => handleNumber('5')}>
          5
        </button>
        <button className="btn btn-number" onClick={() => handleNumber('6')}>
          6
        </button>
        <button className="btn btn-operator btn-highlight" onClick={() => handleOperator('subtract')}>
          −
        </button>

        <button className="btn btn-number" onClick={() => handleNumber('1')}>
          1
        </button>
        <button className="btn btn-number" onClick={() => handleNumber('2')}>
          2
        </button>
        <button className="btn btn-number" onClick={() => handleNumber('3')}>
          3
        </button>
        <button className="btn btn-operator btn-highlight" onClick={() => handleOperator('add')}>
          +
        </button>

        <button className="btn btn-number span-two" onClick={() => handleNumber('0')}>
          0
        </button>
        <button className="btn btn-number" onClick={handleDecimal}>
          .
        </button>
        <button className="btn btn-equals" onClick={handleEquals}>
          =
        </button>
      </div>
    </div>
  );
}
