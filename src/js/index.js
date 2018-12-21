/*import str from './models/Search';
import { add, multiplay, ID } from './views/searchView';
console.log(add(ID, 2));

console.log(`Using imported functions! ${add(ID, 2)} and ${multiplay(3, 5)}. ${str}`);
*/

// https://www.food2fork.com/api/search
// food2fork api key 41251b989d597c7acb41047fe414e65e
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView'; 
import * as recipeView from './views/recipeView';
import * as listView from './views/listView'; 
import {elements, renderLoader, clearLoader}  from './views/base';


/** Global State of the App
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {}
window.state = state;
/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();
  
    /*
    // TESTING
    const query = 'salad';
    */

    if (query) { 
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
        // 4) Search for recipes
        await state.search.getResults();

        // 5) Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (err) { 
            alert ('Error %( . No search results.')
            clearLoader();
        };
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch()
});

/*// TESTING 
window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch()
});
*/


elements.searchResPages.addEventListener('click' , e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); 
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        
    }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // Get the id from url
    const id = window.location.hash.replace('#', '');
    

    if (id) { 
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);
        // t e s t i n g
        //window.r = state.recipe;

        try{
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            
            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // Render the recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch (err) {
            console.log(err);
            alert('Error processing recipe!');
        };
    }
};
//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); 

/**
* LIST CONTROLLER
*/

const controlList = () => {
    // Create a New List if thrre is none yet
    if(!state.list) state.list = new List();

    // Add each element to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);

        listView.renderItem(item);
    });


};

// Handle Delete and Update list item events

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from staste
            state.list.deleteItem(id);
        // delet from UI
            listView.deleteItem(id);

        // Handle the count update    
    } else if(e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10)
        ;
        state.list.updateCount(id, val);
    };
});


// Handling recipe buttons clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease * ')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
        state.recipe.updateServings('dec');
        
        recipeView.updateServingsIngredients(state.recipe);
        };



    } else if (e.target.matches('.btn-increase, .btn-increase * ')) {
         // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
       
        controlList();
    };
})

window.l = new List();


