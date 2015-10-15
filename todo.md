

# Plan of Attack

Two objectives:
  <!-- 1. Pagespeed score of 90+ for index.html, on both mobile & desktop -->
  2. Frame rate of 60fps should be obtained for the pizza.html page (views/pizza.html). The file you need to study and change is views/js/main.js.

Comments should be added to main.js to indicate the optimizations implemented in the pizza.html page.

==================

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

==================

## 2. Frame rate of 60fps for pizza.html

TODO
*Onload*
  <!-- - Optimize large images -->
  - `pizzsElementGenerator()` creating DOM thrashing, looks like it's updating HTML within the loop. Break this out of the loop.
  - `updatePositions()` causing DOM thrashing - triggering layout repeatedly
  - Why is there so much painting happening after load? Looks like the pizza image is just being reloaded a bunch of times.

*After load*
  <!-- - On scroll: `updatePositions()` being called on scroll event. Horrible practice.  REMOVED -->
  - On scroll: something is triggering paint to be called. Weird, no functions. Ahhh! It's those pesky pizza immages.
    - Interesting! Setting position to `fixed` requires repainting -- bc the browser must repaint the images on scroll to maintin their position. 
    - Solution: change position attr of .mover class from fixed to absolute; remove .col-md-6 class. This prevents repainting on scroll.
    - Woohoo! FPS 10x'd!
