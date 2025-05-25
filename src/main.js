import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PAGE_SIZE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
} from './js/render-functions.js';

// =========== html elements founded

const form = document.querySelector('.form');
const input = form.elements['search-text'];
const load_btn = document.querySelector('.js-button-load');

// ========== global constants

let page;
let MAX_PAGE;
let query = '';

//=========== listeners

form.addEventListener('submit', onSearch);
load_btn.addEventListener('click', loadMore);

// ========== paginashon formuls

async function loadMore() {
  showLoader();
  page += 1;

  try {
    const res = await getImagesByQuery(query, page);

    createGallery(res.hits);

    // add slow scroll after render
    smoothScrollAfterLoad();

    checkPageForBtnLoadMore();
  } catch (error) {
    iziToast.error({
      message: 'Network error. Please try later.',
      position: 'topRight',
      timeout: 4000,
    });
  } finally {
    hideLoader();
  }
}

function checkPageForBtnLoadMore() {
  if (page < MAX_PAGE) {
    addBtnLoadMore();
  } else {
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
      timeout: 3000,
    });
    removeBtnLoadMore();
  }
}
function addBtnLoadMore() {
  load_btn.classList.remove('hidden');
}
function removeBtnLoadMore() {
  load_btn.classList.add('hidden');
}

// ========== scroll formuls

function smoothScrollAfterLoad() {
  const galleryItems = document.querySelectorAll('.gallery li');

  if (galleryItems.length === 0) return;
  const firstCardHeight = galleryItems[0].getBoundingClientRect().height;

  window.scrollBy({
    top: firstCardHeight * 2,
    behavior: 'smooth',
  });
}

//=========== global logic

async function onSearch(e) {
  e.preventDefault();

  query = input.value.trim();
  page = 1;
  MAX_PAGE = 1;
  if (query.length < 1) {
    iziToast.info({
      message: 'Search field is empty. Please type a keyword.',
      position: 'topRight',
      timeout: 3000,
    });
    return;
  }

  clearGallery();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    MAX_PAGE = Math.ceil(data.totalHits / PAGE_SIZE);
    console.log(data.totalHits);
    console.log(PAGE_SIZE);
    console.log(MAX_PAGE);

    if (!data.hits.length) {
      iziToast.warning({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        timeout: 4000,
      });
      hideLoader();
      return;
    }

    createGallery(data.hits);
    checkPageForBtnLoadMore();
  } catch (error) {
    iziToast.error({
      message: 'Network error. Please try later.',
      position: 'topRight',
      timeout: 4000,
    });
  }
  hideLoader();
  input.value = '';
}
