let homeHtml = "snippets/home-snippet.html";
$(function () {
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });

  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
  //main-content
  showLoading("#main-content");
  fetch(homeHtml)
    .then((response) => response.text())
    .then(
      (responseText) =>
        (document.querySelector("#main-content").innerHTML = responseText)
    )
    .catch((error) => {
      console.log(error.message + " could not load home page!!!!");
    });
});
let allCategoriesUrl =
  "https://davids-restaurant.herokuapp.com/categories.json";
let categoriesTitleHtml = "snippets/categories-title-snippet.html";
let categoryHtml = "snippets/category-snippet.html";

let menuItemsUrl =
  "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
let menuItemsTitleHtml = "snippets/menu-items-title.html";
let menuItemHtml = "snippets/menu-item.html";
let awardHtml = "snippets/awards-snippet.html";
let insertHtml = function (selector, html) {
  let targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};
let showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};
let insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string.replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};
let switchMenuToActive = function () {
  let classes = document.querySelector("#navHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#navHomeButton").className = classes;
  classes = document.querySelector("#navMenuButton").className;
  if (classes.indexOf("active") == -1) {
    classes += " active";
    document.querySelector("#navMenuButton").className = classes;
  }
};
//document.querySelector(".loadMenu").addEventListener("click", loadMenu);

function loadMenu() {
  showLoading("#main-content");
  switchMenuToActive();
  let urls = [allCategoriesUrl, categoriesTitleHtml, categoryHtml];
  let requests = urls.map((url) => fetch(url));
  console.log(requests); // [Promise, Promise, Promise]
  Promise.all(requests)
    .then((
      responses // [Response, Response, Response]
    ) =>
      Promise.all(
        responses.map((r) =>
          r.headers.get("content-type").indexOf("application/json") !== -1
            ? r.json()
            : r.text()
        )
      )
    )
    // Promise.all can give json response for all at once and results in a single promise which can be passed as a response.
    // This functionality can't be achieved by then block
    .then((content) => {
      console.log(content);
      let categories = content[0];
      let finalHtml = content[1];
      let categoryHtmlR = content[2];
      finalHtml += "<section class='row'>";
      for (let i = 0; i < categories.length; i++) {
        var html = categoryHtmlR;
        var name = "" + categories[i].name;
        var short_name = categories[i].short_name;
        html = insertProperty(html, "name", name);
        html = insertProperty(html, "short_name", short_name);
        finalHtml += html;
      }
      finalHtml += "</section>";
      insertHtml("#main-content", finalHtml);
    });
}

function loadSpecials() {
  fetch(allCategoriesUrl)
    .then((response) => response.json())
    .then((categories) => {
      var randomArrayIndex = Math.floor(Math.random() * categories.length);
      console.log(randomArrayIndex + " randomArrayIndex");
      console.log(
        categories[randomArrayIndex].short_name +
          " categories[randomArrayIndex].short_name"
      );
      var chosenCategoryShortName = categories[randomArrayIndex].short_name;
      loadMenuItems(chosenCategoryShortName);
    });
}

function loadMenuItems(categoryShort) {
  let urls = [menuItemsUrl + categoryShort, menuItemsTitleHtml, menuItemHtml];
  let requests = urls.map((url) => fetch(url)); //doubt object of this fetch
  Promise.all(requests)
    .then((responses) =>
      Promise.all(
        responses.map((r) =>
          r.headers.get("content-type").indexOf("application/json") !== -1
            ? r.json()
            : r.text()
        )
      )
    )
    .then((content) => {
      let categoryMenuItems = content[0];
      let menuItemsTitleHtmlR = content[1];
      let menuItemHtmlR = content[2];
      menuItemsTitleHtmlR = insertProperty(
        menuItemsTitleHtmlR,
        "name",
        categoryMenuItems.category.name
      );
      menuItemsTitleHtmlR = insertProperty(
        menuItemsTitleHtmlR,
        "special_instructions",
        categoryMenuItems.category.special_instructions
      );
      var finalHtml = menuItemsTitleHtmlR;
      finalHtml += "<section class='row'>";
      //loop over categories
      var menuItems = categoryMenuItems.menu_items;
      var catShortName = categoryMenuItems.category.short_name;
      for (var i = 0; i < menuItems.length; i++) {
        // insert menu item values
        var html = menuItemHtmlR;
        html = insertProperty(html, "short_name", menuItems[i].short_name);
        html = insertProperty(html, "catShortName", catShortName);
        html = insertItemPrice(html, "price_small", menuItems[i].price_small);
        html = insertItemPortionName(
          html,
          "small_portion_name",
          menuItems[i].small_portion_name
        );
        html = insertItemPrice(html, "price_large", menuItems[i].price_large);
        html = insertItemPortionName(
          html,
          "large_portion_name",
          menuItems[i].large_portion_name
        );
        html = insertProperty(html, "name", menuItems[i].name);
        html = insertProperty(html, "description", menuItems[i].description);
        // Add clearfix after every second menu item
        if (i % 2 != 0) {
          html +=
            "<div class='clearfix visible-lg-block visible-md-block'></div>";
        }
        finalHtml += html;
      }
      finalHtml += "</section>";
      insertHtml("#main-content", finalHtml);
    });
}
function insertItemPrice(html, pricePropName, priceValue) {
  // If not specified, replace with empty string
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }

  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}

// Appends portion name in parens if it exists
function insertItemPortionName(html, portionPropName, portionValue) {
  // If not specified, return original string
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }

  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}
//AWARDS
function loadAwards() {
  switchMenuToActive();
  fetch(awardHtml)
    .then((response) => response.text())
    .then(
      (responseText) =>
        (document.querySelector("#main-content").innerHTML = responseText)
    );
}
