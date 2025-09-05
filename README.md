# RPN Calculator using Crocks

A RPN (Reverse Polish Notation) command-line based RPN calculator.

This is a Functional Programming port of the [Java RPN project][1] using JavaScript and 
[Crocks][2]. The primary purpose is to show the use of the State Monad in action compared with
an OOP equivalent program that mutates state.

The below are the requirements copied from the Java Project.

>The calculator has a stack that contains real numbers.
>
> - The calculator waits for user input and expects to receive strings containing whitespace 
 separated lists of numbers and operators.
> - Numbers are pushed on to the stack. Operators operate on numbers that are on the stack.
> - Available operators are `+`, `-`, `*`, `/`, `sqrt`, `undo`, `clear`.
> - Operators pop their parameters off the stack, and push their results back onto the stack.
> - The `clear` operator removes all items from the stack.
> - The `undo` operator undoes the previous operation. `undo undo` will undo the previous two 
operations.
> - `sqrt` performs a square root on the top item from the stack.
> - The `+`, `-`, `*`, `/` operators perform addition, subtraction, multiplication and 
 division respectively on the top two items from the stack.
> - After processing an input string, the calculator displays the current contents of the 
 stack as a space-separated list.
> - Numbers are stored on the stack to at least 15 decimal places of precision, but displayed 
 to 10 decimal places (or less if it causes no loss of precision).
> - If an operator cannot find a sufficient number of parameters on the stack, a warning is 
 displayed: `operator <operator> (position: <pos>): insufficient parameters`
> - If an illegal arithmetic operation is attempted (eg: divide by 0), a warning is displayed 
 eg: `operation '1 0 /'  is illegal`. Processing of the input string is stopped, and the 
 illegal operation is undone to allow recovery.
> - After displaying the warning, all further processing of the string terminates and the 
 current state of the stack is displayed.

## Usage

### Requirements

Tested on node 18

### Run

```bash
$ npm run calc
```

### Run Tests

```shell
$ npm run test
```

## Assumptions

No mention was made in the requirements about what to do about invalid input. Invalid input stops the processing of
the string, prints a message and the stack contents.

[1]: https://github.com/kierans/rpn-calculator
[2]: https://crocks.dev
