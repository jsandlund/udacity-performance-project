/*
Welcome to the 60fps project! Your goal is to make Cam's Pizzeria website run
jank-free at 60 frames per second.

There are two major issues in this code that lead to sub-60fps performance. Can
you spot and fix both?


Built into the code, you'll find a few instances of the User Timing API
(window.performance), which will be console.log()ing frame rate data into the
browser console. To learn more about User Timing API, check out:
http://www.html5rocks.com/en/tutorials/webperformance/usertiming/

Creator:
Cameron Pittman, Udacity Course Developer
cameron *at* udacity *dot* com
*/

// Constructor function which builds a Pizza object
var Pizza = function Pizza(){
  this.name = this.generateName();
  this.ingredients = this.generateIngredients();
  this.pizzaContainerHTML = this.buildHTML();
};


// Refactoring the `generator` function
// This function generates & returns a Pizza name by stringing together a randomly selected Adjective & Noun
Pizza.prototype.generateName = function(){

  // Get random adj & noun categories
  var randomNumberAdjCategory = parseInt(Math.random() * adjectives.length);
  var randomNumberNounCategory = parseInt(Math.random() * nouns.length);
  var randomAdjCategory = adjectives[randomNumberAdjCategory];
  var randomNounCategory = nouns[randomNumberNounCategory];

  // Get random adj & noun
  var adjectivesList = getAdj(randomAdjCategory);
  var nounsList = getNoun(randomNounCategory);
  var randomAdjNumber = parseInt(Math.random() * adjectivesList.length);
  var randomNounNumber = parseInt(Math.random() * nounsList.length);
  var randomAdj = adjectivesList[randomAdjNumber];
  var randomNoun = nounsList[randomNounNumber];

  // Build name from random adjective & noun
  var name = "The " + randomAdj.capitalize() + " " + randomNoun.capitalize();
  return name;
};

// Refactoring all of the random ingredient functions into a single function
// This function returns an object containing all the pizza ingredients
Pizza.prototype.generateIngredients = function(){

  var ingredients = {};

  ingredients.meats = [];
  ingredients.nonMeats = [];
  ingredients.cheeses = [];
  ingredients.sauce = '';
  ingredients.crust = '';

  var numMeats = Math.floor((Math.random() * 4)),
      numNonMeats = Math.floor((Math.random() * 3)),
      numCheeses = Math.floor((Math.random() * 2));

  // add random # of many-count ingredients
    for (var i = 0; i < numMeats; i++) { // meats
      ingredients.meats.push(pizzaIngredients.meats[Math.floor((Math.random() * pizzaIngredients.meats.length))]);
    }
    for (var j = 0; j < numNonMeats; j++) { // nonMeats
      ingredients.nonMeats.push(pizzaIngredients.nonMeats[Math.floor((Math.random() * pizzaIngredients.nonMeats.length))]);
    }
    for (var k = 0; k < numCheeses; k++) { // cheeses
      ingredients.cheeses.push(pizzaIngredients.cheeses[Math.floor((Math.random() * pizzaIngredients.cheeses.length))]);
    }

  // add single-count ingredients
    ingredients.sauce = pizzaIngredients.sauces[Math.floor(Math.random() * pizzaIngredients.sauces.length)];
    ingredients.crust = pizzaIngredients.crusts[Math.floor(Math.random() * pizzaIngredients.crusts.length)];

  return ingredients;
};

// This function builds and returns the HTML for each Pizza
// It only builds the HTML. It does not touch the DOM.
Pizza.prototype.buildHTML = function() {

  var pizzaContainer,             // contains pizza title, image and list of ingredients
      pizzaImageContainer,        // contains the pizza image
      pizzaImage,                 // the pizza image itself
      pizzaDescriptionContainer,  // contains the pizza title and list of ingredients
      pizzaName,                  // the pizza name itself
      ul;                          // the list of ingredients

  // create element scaffolding
    pizzaContainer  = document.createElement("div");
    pizzaImageContainer = document.createElement("div");
    pizzaImage = document.createElement("img");
    pizzaDescriptionContainer = document.createElement("div");
    pizzaContainer.classList.add("randomPizzaContainer");
    pizzaContainer.style.width = "33.33%";
    pizzaContainer.style.height = "325px";
    // pizzaContainer.id = "pizza" + i;                // gives each pizza element a unique id
    pizzaImageContainer.classList.add("col-md-6");
    pizzaImage.src = "images/pizza.png";
    pizzaImage.classList.add("img-responsive");
    pizzaImageContainer.appendChild(pizzaImage);
    pizzaContainer.appendChild(pizzaImageContainer);
    pizzaDescriptionContainer.classList.add("col-md-6");

  // populate with data
    // name
    pizzaName = document.createElement("h4");
    pizzaName.innerHTML = this.name;
    pizzaDescriptionContainer.appendChild(pizzaName);

    // ingredients
    ul = document.createElement("ul");

      var ingredient;
      for (ingredient in this.ingredients.meats) { ul.innerHTML += ingredientItemizer(this.ingredients.meats[ingredient]);}
      for (ingredient in this.ingredients.nonMeats) { ul.innerHTML += ingredientItemizer(this.ingredients.nonMeats[ingredient]);}
      for (ingredient in this.ingredients.cheeses) { ul.innerHTML += ingredientItemizer(this.ingredients.cheeses[ingredient]);}
      ul.innerHTML += ingredientItemizer(this.ingredients.sauce);
      ul.innerHTML += ingredientItemizer(this.ingredients.crust);

    pizzaDescriptionContainer.appendChild(ul);
    pizzaContainer.appendChild(pizzaDescriptionContainer);

    return pizzaContainer;
};

// This function builds X number of Pizza objects;
// attaches each objects' pizzaContainerHTML property to a document Fragment;
// and then returns that fragment
function pizzaFactory(){

  var pizzasFragment = document.createDocumentFragment(),
      pizza;

  for (var i = 0; i < settings.numPizzas; i++) {
    pizza = new Pizza();
    pizzasFragment.appendChild(pizza.pizzaContainerHTML);
  }

  return pizzasFragment;
}


// ======================================================================================================================================= //

// Pulls adjective out of array using random number sent from generator
function getAdj(x){
  switch(x) {
    case "dark":
      var dark = ["dark","morbid", "scary", "spooky", "gothic", "deviant", "creepy", "sadistic", "black", "dangerous", "dejected", "haunted",
      "morose", "tragic", "shattered", "broken", "sad", "melancholy", "somber", "dark", "gloomy", "homicidal", "murderous", "shady", "misty",
      "dusky", "ghostly", "shadowy", "demented", "cursed", "insane", "possessed", "grotesque", "obsessed"];
      return dark;
    case "color":
      var colors = ["blue", "green", "purple", "grey", "scarlet", "NeonGreen", "NeonBlue", "NeonPink", "HotPink", "pink", "black", "red",
      "maroon", "silver", "golden", "yellow", "orange", "mustard", "plum", "violet", "cerulean", "brown", "lavender", "violet", "magenta",
      "chestnut", "rosy", "copper", "crimson", "teal", "indigo", "navy", "azure", "periwinkle", "brassy", "verdigris", "veridian", "tan",
      "raspberry", "beige", "sandy", "ElectricBlue", "white", "champagne", "coral", "cyan"];
      return colors;
    case "whimsical":
      var whimsy = ["whimsical", "silly", "drunken", "goofy", "funny", "weird", "strange", "odd", "playful", "clever", "boastful", "breakdancing",
      "hilarious", "conceited", "happy", "comical", "curious", "peculiar", "quaint", "quirky", "fancy", "wayward", "fickle", "yawning", "sleepy",
      "cockeyed", "dizzy", "dancing", "absurd", "laughing", "hairy", "smiling", "perplexed", "baffled", "cockamamie", "vulgar", "hoodwinked",
      "brainwashed"];
      return whimsy;
    case "shiny":
      var shiny = ["sapphire", "opal", "silver", "gold", "platinum", "ruby", "emerald", "topaz", "diamond", "amethyst", "turquoise",
      "starlit", "moonlit", "bronze", "metal", "jade", "amber", "garnet", "obsidian", "onyx", "pearl", "copper", "sunlit", "brass", "brassy",
      "metallic"];
      return shiny;
    case "noisy":
      var noisy = ["untuned", "loud", "soft", "shrieking", "melodious", "musical", "operatic", "symphonic", "dancing", "lyrical", "harmonic",
      "orchestral", "noisy", "dissonant", "rhythmic", "hissing", "singing", "crooning", "shouting", "screaming", "wailing", "crying", "howling",
      "yelling", "hollering", "caterwauling", "bawling", "bellowing", "roaring", "squealing", "beeping", "knocking", "tapping", "rapping",
      "humming", "scatting", "whispered", "whispering", "rasping", "buzzing", "whirring", "whistling", "whistled"];
      return noisy;
    case "apocalyptic":
      var apocalyptic = ["nuclear", "apocalyptic", "desolate", "atomic", "zombie", "collapsed", "grim", "fallen", "collapsed", "cannibalistic",
      "radioactive", "toxic", "poisonous", "venomous", "disastrous", "grimy", "dirty", "undead", "bloodshot", "rusty", "glowing", "decaying",
      "rotten", "deadly", "plagued", "decimated", "rotting", "putrid", "decayed", "deserted", "acidic"];
      return apocalyptic;
    case "insulting":
      var insulting = ["stupid", "idiotic", "fat", "ugly", "hideous", "grotesque", "dull", "dumb", "lazy", "sluggish", "brainless", "slow",
      "gullible", "obtuse", "dense", "dim", "dazed", "ridiculous", "witless", "daft", "crazy", "vapid", "inane", "mundane", "hollow", "vacuous",
      "boring", "insipid", "tedious", "monotonous", "weird", "bizarre", "backward", "moronic", "ignorant", "scatterbrained", "forgetful", "careless",
      "lethargic", "insolent", "indolent", "loitering", "gross", "disgusting", "bland", "horrid", "unseemly", "revolting", "homely", "deformed",
      "disfigured", "offensive", "cowardly", "weak", "villainous", "fearful", "monstrous", "unattractive", "unpleasant", "nasty", "beastly", "snide",
      "horrible", "syncophantic", "unhelpful", "bootlicking"];
      return insulting;
    case "praise":
      var praise = ["beautiful", "intelligent", "smart", "genius", "ingenious", "gorgeous", "pretty", "witty", "angelic", "handsome", "graceful",
      "talented", "exquisite", "enchanting", "fascinating", "interesting", "divine", "alluring", "ravishing", "wonderful", "magnificient", "marvelous",
      "dazzling", "cute", "charming", "attractive", "nifty", "delightful", "superior", "amiable", "gentle", "heroic", "courageous", "valiant", "brave",
      "noble", "daring", "fearless", "gallant", "adventurous", "cool", "enthusiastic", "fierce", "awesome", "radical", "tubular", "fearsome",
      "majestic", "grand", "stunning"];
      return praise;
    case "scientific":
      var scientific = ["scientific", "technical", "digital", "programming", "calculating", "formulating", "cyberpunk", "mechanical", "technological",
      "innovative", "brainy", "chemical", "quantum", "astro", "space", "theoretical", "atomic", "electronic", "gaseous", "investigative", "solar",
      "extinct", "galactic"];
      return scientific;
    default:
      var scientific_default = ["scientific", "technical", "digital", "programming", "calculating", "formulating", "cyberpunk", "mechanical", "technological",
      "innovative", "brainy", "chemical", "quantum", "astro", "space", "theoretical", "atomic", "electronic", "gaseous", "investigative", "solar",
      "extinct", "galactic"];
      return scientific_default;
  }
}

// Pulls noun out of array using random number sent from generator
function getNoun(y) {
  switch(y) {
    case "animals":
      var animals = ["flamingo", "hedgehog", "owl", "elephant", "pussycat", "alligator", "dachsund", "poodle", "beagle", "crocodile", "kangaroo",
      "wallaby", "woodpecker", "eagle", "falcon", "canary", "parrot", "parakeet", "hamster", "gerbil", "squirrel", "rat", "dove", "toucan",
      "raccoon", "vulture", "peacock", "goldfish", "rook", "koala", "skunk", "goat", "rooster", "fox", "porcupine", "llama", "grasshopper",
      "gorilla", "monkey", "seahorse", "wombat", "wolf", "giraffe", "badger", "lion", "mouse", "beetle", "cricket", "nightingale",
      "hawk", "trout", "squid", "octopus", "sloth", "snail", "locust", "baboon", "lemur", "meerkat", "oyster", "frog", "toad", "jellyfish",
      "butterfly", "caterpillar", "tiger", "hyena", "zebra", "snail", "pig", "weasel", "donkey", "penguin", "crane", "buzzard", "vulture",
      "rhino", "hippopotamus", "dolphin", "sparrow", "beaver", "moose", "minnow", "otter", "bat", "mongoose", "swan", "firefly", "platypus"];
      return animals;
    case "profession":
      var professions = ["doctor", "lawyer", "ninja", "writer", "samurai", "surgeon", "clerk", "artist", "actor", "engineer", "mechanic",
      "comedian", "fireman", "nurse", "RockStar", "musician", "carpenter", "plumber", "cashier", "electrician", "waiter", "president", "governor",
      "senator", "scientist", "programmer", "singer", "dancer", "director", "mayor", "merchant", "detective", "investigator", "navigator", "pilot",
      "priest", "cowboy", "stagehand", "soldier", "ambassador", "pirate", "miner", "police"];
      return professions;
    case "fantasy":
      var fantasy = ["centaur", "wizard", "gnome", "orc", "troll", "sword", "fairy", "pegasus", "halfling", "elf", "changeling", "ghost",
      "knight", "squire", "magician", "witch", "warlock", "unicorn", "dragon", "wyvern", "princess", "prince", "king", "queen", "jester",
      "tower", "castle", "kraken", "seamonster", "mermaid", "psychic", "seer", "oracle"];
      return fantasy;
    case "music":
      var music = ["violin", "flute", "bagpipe", "guitar", "symphony", "orchestra", "piano", "trombone", "tuba", "opera", "drums",
      "harpsichord", "harp", "harmonica", "accordion", "tenor", "soprano", "baritone", "cello", "viola", "piccolo", "ukelele", "woodwind", "saxophone",
      "bugle", "trumpet", "sousaphone", "cornet", "stradivarius", "marimbas", "bells", "timpani", "bongos", "clarinet", "recorder", "oboe", "conductor",
      "singer"];
      return music;
    case "horror":
      var horror = ["murderer", "chainsaw", "knife", "sword", "murder", "devil", "killer", "psycho", "ghost", "monster", "godzilla", "werewolf",
      "vampire", "demon", "graveyard", "zombie", "mummy", "curse", "death", "grave", "tomb", "beast", "nightmare", "frankenstein", "specter",
      "poltergeist", "wraith", "corpse", "scream", "massacre", "cannibal", "skull", "bones", "undertaker", "zombie", "creature", "mask", "psychopath",
      "fiend", "satanist", "moon", "fullMoon"];
      return horror;
    case "gross":
      var gross = ["slime", "bug", "roach", "fluid", "pus", "booger", "spit", "boil", "blister", "orifice", "secretion", "mucus", "phlegm",
      "centipede", "beetle", "fart", "snot", "crevice", "flatulence", "juice", "mold", "mildew", "germs", "discharge", "toilet", "udder", "odor", "substance",
      "fluid", "moisture", "garbage", "trash", "bug"];
      return gross;
    case "everyday":
      var everyday = ["mirror", "knife", "fork", "spork", "spoon", "tupperware", "minivan", "suburb", "lamp", "desk", "stereo", "television", "TV",
      "book", "car", "truck", "soda", "door", "video", "game", "computer", "calender", "tree", "plant", "flower", "chimney", "attic", "kitchen",
      "garden", "school", "wallet", "bottle"];
      return everyday;
    case "jewelry":
      var jewelry = ["earrings", "ring", "necklace", "pendant", "choker", "brooch", "bracelet", "cameo", "charm", "bauble", "trinket", "jewelry",
      "anklet", "bangle", "locket", "finery", "crown", "tiara", "blingBling", "chain", "rosary", "jewel", "gemstone", "beads", "armband", "pin",
      "costume", "ornament", "treasure"];
      return jewelry;
    case "places":
      var places = ["swamp", "graveyard", "cemetery", "park", "building", "house", "river", "ocean", "sea", "field", "forest", "woods", "neighborhood",
      "city", "town", "suburb", "country", "meadow", "cliffs", "lake", "stream", "creek", "school", "college", "university", "library", "bakery",
      "shop", "store", "theater", "garden", "canyon", "highway", "restaurant", "cafe", "diner", "street", "road", "freeway", "alley"];
      return places;
    case "scifi":
      var scifi = ["robot", "alien", "raygun", "spaceship", "UFO", "rocket", "phaser", "astronaut", "spaceman", "planet", "star", "galaxy",
      "computer", "future", "timeMachine", "wormHole", "timeTraveler", "scientist", "invention", "martian", "pluto", "jupiter", "saturn", "mars",
      "quasar", "blackHole", "warpDrive", "laser", "orbit", "gears", "molecule", "electron", "neutrino", "proton", "experiment", "photon", "apparatus",
      "universe", "gravity", "darkMatter", "constellation", "circuit", "asteroid"];
      return scifi;
    default:
      var scifi_default = ["robot", "alien", "raygun", "spaceship", "UFO", "rocket", "phaser", "astronaut", "spaceman", "planet", "star", "galaxy",
      "computer", "future", "timeMachine", "wormHole", "timeTraveler", "scientist", "invention", "martian", "pluto", "jupiter", "saturn", "mars",
      "quasar", "blackHole", "warpDrive", "laser", "orbit", "gears", "molecule", "electron", "neutrino", "proton", "experiment", "photon", "apparatus",
      "universe", "gravity", "darkMatter", "constellation", "circuit", "asteroid"];
      return scifi_default;
  }
}

  // Updates pizza sizes
  function changePizzaSizes(size) {
    var newWidth,
        pizzaSizeLabel,
        randomPizzas;

    // assign variables only if they haven't already been assigned; 
    if (!pizzaSizeLabel) {pizzaSizeLabel = document.getElementById('pizzaSize');}
    if (!randomPizzas) {randomPizzas = document.querySelectorAll(".randomPizzaContainer");}

    switch(size) {
      case "1":
        pizzaSizeLabel.innerHTML = "Small";
        newWidth = 25;
        updatePizzasWidth();
        return;
      case "2":
        pizzaSizeLabel.innerHTML = "Medium";
        newWidth = 33.3;
        updatePizzasWidth();
        return;
      case "3":
        pizzaSizeLabel.innerHTML = "Large";
        newWidth = 50;
        updatePizzasWidth();
        return;
      default:
        console.log("bug in sizeSwitcher");
    }

    function updatePizzasWidth(){
      for (var i = 0; i < randomPizzas.length; i++) {
        randomPizzas[i].style.width = newWidth + '%';
      }
    }
  }

function generateBGPizzas(){

  // remove calls to document object to prevent DOM thrashing.
  var elem,
      pizzasContainer = document.getElementById('movingPizzas1'),
      cols = 8,
      rowNum = 0,
      colNum = 0,
      rowSpacePx = 200,
      colSpacePx = 200,
      posX = 0,
      currentCol = 1,
      docFrag = document.createDocumentFragment();

  for (var i = 0; i < 200; i++) {
    // when i hits cols number, reset current column to 0
    // this prevents pizzas moving infinintely to the right
    if ( (i  % cols) === 0 ) {
      currentCol = 1;
    }

    // Set current row number
    rowNum = Math.floor(i / cols);

    elem = document.createElement('img');
    elem.className = 'mover';
    elem.src = "images/pizza.png";

    // if first column, set left attribute to to 0
    if (currentCol === 1) {
      elem.style.left = 0 + "px";
     } else {
      elem.style.left = ( (currentCol - 1) * colSpacePx) + "px";
    }

    elem.style.top = (rowNum * rowSpacePx) + "px";
    elem.style.height = "100px";
    elem.style.width = "73.333px";
    pizzasContainer.appendChild(elem);

    // increment current column
    currentCol++;

    docFrag.appendChild(elem);
  }

  // Write all elements to DOM at once using docFrag, to prevent multiple calls to DOM
  pizzasContainer.appendChild(docFrag);

  // moved updatePositions functionality within for loop of generatePizzas
  // updatePositions();
}
