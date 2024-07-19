import axios, { AxiosError } from 'axios';
import BookSearchApiClient from './books-search/BookSearchApiClient';

const getBooksList = async () => {
    const client = new BookSearchApiClient();
    try {
        //Search by Author name
        const booksByShakespear = await client.getBooksByAuthor("Shakespear", 10);
        console.log('Books by Author:', booksByShakespear);

        //Search by year when books are publsihed
        const booksByYears = await client.getBooksByYear(1990, 5);
        console.log('Books by Published Year:', booksByYears);

        //Search by Publisher based books
        const booksByPublisher = await client.getBooksByPublisher("Macmillan", 5)
        console.log('Books by Publisher:', booksByPublisher);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.response) {
              console.error('Request failed with status:', axiosError.response.status);
            } else if (axiosError.request) {
              console.error('No response received from server');
            } else {
              console.error('Error setting up the request:', axiosError.message);
            }
        }
    }
}

getBooksList();