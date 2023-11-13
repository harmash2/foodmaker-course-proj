import View from './View.js';
import previewView from './previewView.js'
import icons from '../../img/icons.svg';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes for your query';
  _message = '';

  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('')
  }
}

export default new ResultsView();


{/* <div class="preview__user-generated">
<svg>
  <use href="${icons}#icon-user"></use>
</svg>
</div> */}