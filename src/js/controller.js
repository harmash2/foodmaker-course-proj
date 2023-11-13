// bussines logic model.js
import * as model from './model.js';
import { MODAL_CLOSE } from './config.js';
import recipeVew from './Views/recipeVew.js';
import searchView from './Views/searchView.js';
import resultsView from './Views/resultsView.js';
import paginationView from './Views/paginView.js';
import bookmarkView from './Views/bookmarkView.js';
import addRecipeView from './Views/addRecipeView.js';

import 'core-js/stable'; // polifyling for old browsers
import 'regenerator-runtime/runtime'; // polifyling for old browsers

// https://forkify-api.herokuapp.com/v2
//* ////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }


const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeVew.renderSpinner();
    
    // 0 Update results view to selected
    resultsView.update(model.getSearchResultPage());
    bookmarkView.update(model.state.bookmarks)
    
    // 1) Loading recipe
    await model.loadRecipe(id);
    
    // 2) Rendering recipe
    recipeVew.render(model.state.recipe);

  } catch (err) {
    console.error(err)
    recipeVew.renderError(` 💥💥💥 ${err}`);
  }
}


const controlSearchResults = async function() {
  try {
    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    resultsView.renderSpinner();

    // Load search results
    await model.loadSearchResults(query);
    
    // Render results
    resultsView.render(model.getSearchResultPage())

    // Render pagination
    paginationView.render(model.state.search)

  } catch (err) {
    console.log(err);
  }
};


const controlPagination = function(goPage) {
      // Render NEW results
      resultsView.render(model.getSearchResultPage(goPage))

      // Render NEW pagination
      paginationView.render(model.state.search)
  console.log(goPage);
};


const controlServings = function(newServings) {
  // update recipe servings
  model.updateServings(newServings);

  // update the recipe view
  //* recipeVew.render(model.state.recipe);
  recipeVew.update(model.state.recipe);
};


const controlAddBookmark = function() {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2) Update recipe view
  recipeVew.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarkView.render(model.state.bookmarks)
};


const controlBookmarks = function(){
  bookmarkView.render(model.state.bookmarks)
};


const controlAddRecipe = async function(newRecipe) {
  try {
    // Show spinner
    addRecipeView.renderSpinner()

    // Upload new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeVew.render(model.state.recipe);

    // Succes messasge
    addRecipeView.renderMessage()

    // Render bookmark view 
    bookmarkView.render(model.state.bookmarks);

    // Chenge ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE * 1000)
  } catch (err) {
    console.error('💩', err);
    addRecipeView.renderError(err.message);
  }
};





const init = function() {
  bookmarkView.addHendlerRender(controlBookmarks);
  recipeVew.addHandlerRender(controlRecipes);
  recipeVew.addHandlerUpdateServings(controlServings);
  recipeVew.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
