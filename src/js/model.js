import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, RES_PER_PAGE_S, KEY } from './config.js'
// import { AJAX, AJAX } from './helper.js';
import { AJAX } from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    page: 1,
    results: [],
    resultsPerPage: `${window.innerWidth > 980 ? RES_PER_PAGE : RES_PER_PAGE_S}`,
  },
  bookmarks: [],
};


const createRecipeObj = function(data) {
  const {recipe} = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && {key: recipe.key})
  };
}


export const loadRecipe = async function(id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`)
  
    state.recipe = createRecipeObj(data)

    if (state.bookmarks.some(bookmark => bookmark.id === id )) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }

  } catch (err) {
    // Temp error handler
    console.error(`Model.js error 💥💥💥 ${err}`);
    throw err;
  }
};


export const loadSearchResults = async function(queryStr) {
  try {
    state.search.query = queryStr;
    const data = await AJAX(`${API_URL}?search=${queryStr}&key=${KEY}`);
    state.search.results = data.data.recipes.map(el => {
      return {
        id: el.id,
        title: el.title,
        publisher: el.publisher,
        image: el.image_url,
        ...(el.key && {key: el.key})
      }
    });

    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥`);
    throw err
  }
};


export const getSearchResultPage = function(page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage // 0;
  const end = page * state.search.resultsPerPage // 9 for sclice method

  return state.search.results.slice(start, end);
}


export const updateServings = function(newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * newServings / state.recipe.servings;
  });
  
  state.recipe.servings = newServings;
};


const saveBookmarks = function() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}


export const addBookmark = function(recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  saveBookmarks();
};

export const deleteBookmark = function(id) {
  const index = state.bookmarks.findIndex(ind => ind.id === id);
  state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;

  saveBookmarks();
};

const init = function() {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage)
}
init();


const clearBookmarks = function() {
  localStorage.clear('bookmarks');
};
// clearBookmarks()


export const uploadRecipe = async function(newRecipe) {
  try {

    const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') &&
      entry[1] !== '').map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());
      
        if(ingArr.length !== 3) throw new Error('Wrong ingredient format. Need to separate its with comas');

        const [quantity, unit, description] = ingArr
        return { quantity: quantity ? +quantity : null, unit, description };
    });
    
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(recipe);


    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObj(data);
    addBookmark(state.recipe)
  } catch (err) {
    throw err;
  }
}