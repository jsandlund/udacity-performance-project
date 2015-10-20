# Udacity Frontend Nanodgree Program - Project 03 - Website Performance Optimization


## Project Overview
This project is part of Udacity's FrontEnd Nanodegree Program. It intends to evaluate a student's understanding of web performance concepts & optimization techniques. Students were given a website suffering from self-inflicted performance wounds and asked to discover, evaluate and fix key performance issues. We were given two pages to optimize:

1. **index.html** Achieve Google Pagespeed score of at least 90 for Desktop & Mobile
2. **pizza.html** Achieve a frame rate of 60 fps when scrolling; Time to resize pizzas less than 5 ms

Link to original, non-optimized site: https://github.com/udacity/frontend-nanodegree-mobile-portfolio

## Change Log

1. **index.html**
  - Optimized images
  - Removed custom font
  - Minified & inlined critical CSS
2. **pizza.html**
  - on load changes:
    - optimized images
    - massively refactored code base to improve clarity and extensibilty. Now uses a Constructor function to build & manage pizza objects, instead a bunch of disparate, non-related functions.
    - refactored single JS file into multiple JS files to improve clarity
    - used document fragments to prevent DOM calls within for loops
  - on scroll changes:
    - Removed all on scroll event handlers. background pizza images are now static. The "moving effect" was distracting.
  - on pizza resize changes:
    - Use document fragments to prevent DOM thrashing: the script now creates all the html markup and accesses the DOM only once to append it, opposed to appending html for every new element.
    - Used data attributes & classes to update the size of pizzas, opposed to updating the inline style properties of each pizza. This more declarative and performant.
    - killed the rx function; it was redundant.
3. **Global optimizations**
  - Used gulp to minify and concatenate JS, CSS & HTML files

## Kudos!

- Zell Liew for his AWESOME [Gulp for Beginners Tutorial](https://css-tricks.com/gulp-for-beginners/)
