import fetchImages from './js/fetch-images';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { onRenderGallery } from './js/render-gallery';

const { searchForm, gallery, loadMoreBtn, endCollectionText } = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  endCollectionText: document.querySelector('.end-collection-text'),
};

function renderCardImage(arr) {
  const markup = arr.map(item => cardTemplate(item)).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

let currentPage = 1;
let currentHits = 0;
let searchQuery = '';
let isLoading = false;

searchForm.addEventListener('submit', onSubmitSearchForm);

async function onSubmitSearchForm(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.searchQuery.value;
  currentPage = 1;

  if (searchQuery === '') {
    return;
  }

  const response = await fetchImages(searchQuery, currentPage);
  currentHits = response.hits.length;

  if (response.totalHits > 40) {
    loadMoreBtn.classList.remove('is-hidden');
  } else {
    loadMoreBtn.classList.add('is-hidden');
  }

  try {
    if (response.totalHits > 0) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      gallery.innerHTML = '';
      onRenderGallery(response.hits, gallery, lightbox);
      lightbox.refresh();
      endCollectionText.classList.add('is-hidden');

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * -100,
        behavior: 'smooth',
      });
    }

    if (response.totalHits === 0) {
      gallery.innerHTML = '';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.classList.add('is-hidden');
      endCollectionText.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);

let isEndOfCollection = false;
let isEndOfCollectionNotified = false;
let loadMoreClicks = 0;

async function onClickLoadMoreBtn() {
  if (isLoading) {
    return;
  }

  isLoading = true;

  currentPage += 1;
  const response = await fetchImages(searchQuery, currentPage);

  if (response.totalHits === 0 || currentHits === response.totalHits) {
    loadMoreBtn.classList.add('is-hidden');
    endCollectionText.classList.remove('is-hidden');

    isLoading = false;
    return;
  }

  onRenderGallery(response.hits, gallery, lightbox);
  lightbox.refresh();
  currentHits += response.hits.length;

  loadMoreClicks++;

  if (loadMoreClicks === 1) {
    Notify.success(`Hooray! We found ${response.totalHits} images.`);
  }

  if (loadMoreClicks === 2) {
    Notify.success(`Hooray! We found ${response.totalHits} images.`);
    loadMoreBtn.classList.add('is-hidden');
    isEndOfCollection = true;
  }

  isLoading = false;
}

window.addEventListener('scroll', () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 50 && isEndOfCollection) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    window.removeEventListener('scroll', () => {});
  }
});
