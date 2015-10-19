

# Plan of Attack

Two objectives:
  <!-- 1. Pagespeed score of 90+ for index.html, on both mobile & desktop -->
  2. Frame rate of 60fps should be obtained for the pizza.html page (views/pizza.html). The file you need to study and change is views/js/main.js.

Comments should be added to main.js to indicate the optimizations implemented in the pizza.html page.

## 1. Pagespeed score 90+ for index.html - DONE
- Install ngrok
- Run through pagespeed inspights

Changes
  - Optimized pizzaria image
  - Optimized headshot
  - Removed custom font
  - Inlined & Minified CSS

Questions
  1. Why does Parse HTML run twice on index.html?

## Frame rate of 60fps for pizza.html

TODO
*Onload*
  - Optimize large images
  - `pizzsElementGenerator()` creating DOM thrashing, looks like it's updating HTML within the loop. Break this out of the loop.
    - Why is there so much painting happening after load? Looks like the pizza image is just being reloaded a bunch of times.
    - To prevent DOM calls in for loops I used document fragments within teh loop and appended the fragment to the document after the loop
  - should use webworker for two scripts
  - do i really need to use a web worker? does this optimize speed?


*After load*
  - On scroll: `updatePositions()`, which affects layout, is being called on scroll event. Horrible practice.
  - Resizing pizzas is innefficient
    - use data attributes & classes to resize instead of of setting the style property
    - kill Rx function; redundant & expensive. 
