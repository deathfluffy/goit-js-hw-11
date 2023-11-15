import { fetchPhoto } from './js/fetch-images';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './js/render-gallery';
import { refs } from './js/refs';
import { lightbox } from './js/lightbox';

const { searchForm, gallery, btnLoadMore } = refs;

const paramsForNotify = {
  position: 'center-center',
  timeout: 4000,
  width: '400px',
  fontSize: '24px',
};

const imagesPerPage = 40;
let currentPage = 1;
let keyOfSearchPhoto = '';

btnLoadMore.classList.add('is-hidden');

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
  currentPage = 1;
  event.preventDefault();

  gallery.innerHTML = '';

  const { searchQuery } = event.currentTarget.elements;
  keyOfSearchPhoto = searchQuery.value
    .trim()
    .toLowerCase()
    .split(' ')
    .join('+');

  if (keyOfSearchPhoto === '') {
    Notify.info('Enter your request, please!', paramsForNotify);
    return;
  }

  fetchPhoto(keyOfSearchPhoto, currentPage, imagesPerPage)
    .then(data => {
      const searchResults = data.hits;
      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          paramsForNotify
        );
      } else {
        Notify.success(
          `Hooray! We found ${data.totalHits} images.`,
          paramsForNotify
        );

        createMarkup(searchResults);
        lightbox.refresh();
      }
      if (data.totalHits > imagesPerPage) {
        btnLoadMore.classList.remove('is-hidden');
        window.addEventListener('scroll', showLoadMorePage);
      }
      scrollPage();
    })
    .catch(onFetchError);

  btnLoadMore.addEventListener('click', onClickLoadMore);

  event.currentTarget.reset();
}

function onClickLoadMore() {
  currentPage++;

  fetchPhoto(keyOfSearchPhoto, currentPage, imagesPerPage)
    .then(data => {
      const searchResults = data.hits;
      const totalHits = data.totalHits;

      const totalNumberOfPages = Math.ceil(totalHits / imagesPerPage);

      if (currentPage < totalNumberOfPages) {
        createMarkup(searchResults);
        lightbox.refresh();
      } else {
        btnLoadMore.classList.add('is-hidden');
        Notify.info(
          "We're sorry, but you've reached the end of search results.",
          paramsForNotify
        );
        btnLoadMore.removeEventListener('click', onClickLoadMore);
        window.removeEventListener('scroll', showLoadMorePage);
      }
    })
    .catch(onFetchError);
}

function onFetchError() {
  Notify.failure(
    'Oops! Something went wrong! Try reloading the page or make another choice!',
    paramsForNotify
  );
}

function scrollPage() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function showLoadMorePage() {
  if (checkIfEndOfPage()) {
    onClickLoadMore();
  }
}

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}
