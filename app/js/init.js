(function init() {

  // build and append Pizza objects
  var randomPizzasHTMLFragment = pizzaFactory();
  var randomPizzasContainerDiv = document.getElementById("randomPizzas");
  randomPizzasContainerDiv.appendChild(randomPizzasHTMLFragment);

  // generate background pizzas
  generateBGPizzas();

  // call updateBGPizzas on scroll
  window.addEventListener('scroll', function(){
    // use requestAnimationFrame for better perfr
    window.requestAnimationFrame(updateBGPizzas);
  });

})();
