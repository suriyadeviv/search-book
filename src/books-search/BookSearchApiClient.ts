import axios from 'axios';
import { create } from 'xmlbuilder2';
import { Book, BookApiObject, BooksApiResponse, SupportedFormat } from './types';
import { config } from '../../config';

/**
 * BookSearchApiClient class for searching the Books based on AuthorName, published year or publisher.
 * Defaults to 'json' format.
 * Throws error if request fails.
 */
class BookSearchApiClient {
  private format: string;

  constructor(format: string = SupportedFormat.Json) {
    this.format = format;
  }

  async getBooksByAuthor(authorName: string, limit: number = 10): Promise<Book[] | string> {
    const url = `${config.baseUrl}${config.authorQuery}` + this.createQueryParams(authorName, limit);
    return this.getBooksResult(url);
  }

  async getBooksByYear(year: number, limit: number = 10): Promise<Book[] | string> {
    const url = `${config.baseUrl}${config.yearQuery}` + this.createQueryParams(year.toString(), limit);
    return this.getBooksResult(url);
  }

  async getBooksByPublisher(publisher: string, limit: number = 10): Promise<Book[] | string> {
    const url = `${config.baseUrl}${config.publisherQuery}` + this.createQueryParams(publisher, limit);
    return this.getBooksResult(url);
  }

  async getBooksResult(url: string): Promise<Book[] | string> {
    try {
      const response: BooksApiResponse = await axios.get(url);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error occured while getting data from', `${url}`);
      throw error;
    }
  }

  createQueryParams(qParam: string, limit: number) {
    return `?q=${encodeURIComponent(qParam)}&limit=${limit}&format=${this.format}`
  }

  /**
   * formatResponse checks the response data and format it to Book array..
   * Throws error if its in unsupported format.
   */
  formatResponse(data: BooksApiResponse): Book[] | string {
    let resultList: Book[] = [];
    if (this.format === SupportedFormat.Json) {
      resultList = data.results.map((item: BookApiObject) => {
        const book: Book = {
          title: item?.book?.title,
          author: item?.book?.author,
          isbn: Number(item?.book?.isbn),
          quantity: Number(item?.stock?.quantity),
          price: Number(item?.stock?.price),
        };

        return book;
      });
    } else if (this.format === SupportedFormat.XML) {
      const doc = create(data);
      const booksXml = doc.end({ format: 'object' }) as any;
      resultList = booksXml.root.results.item.map((item: any) => ({
        title: item?.book?.title,
        author: item?.book?.author,
        isbn: parseInt(item?.book?.isbn),
        quantity: parseInt(item?.stock?.quantity),
        price: parseInt(item?.stock?.price)
      }));
    } else {
      throw new Error(
        "Unsupported Format. Please send response in JSON Object or XML"
      );
    }
    return resultList;
  }
}

export default BookSearchApiClient;
