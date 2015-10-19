(function init() {

  // build and append Pizza objects 
  var randomPizzasHTMLFragment = pizzaFactory();
  var randomPizzasContainerDiv = document.getElementById("randomPizzas");
  randomPizzasContainerDiv.appendChild(randomPizzasHTMLFragment);

  // generate background pizzas
  generateBGPizzas();
})();
