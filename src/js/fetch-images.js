import axios from 'axios';

const URL = 'https://pixabay.com/api/';
const KEY = '34523545-f21683fd59bfc3e4e2549fe07';

export async function fetchPhoto(q, page, perPage) {
  const url = `${URL}?key=${KEY}&q=${q}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`;
  const response = await axios.get(url);
  return response.data;
}
