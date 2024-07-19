import axios from "axios";
import { Book, BooksApiResponse } from "./types";
import BookSearchApiClient from "./BookSearchApiClient";

jest.mock('axios');

describe("BookSearchApiClient", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    const testRawDataBooks: BooksApiResponse = {
        results: [
            {
                book: {
                    title: "Horton Hears a Who!",
                    author: "Dr. Seuss",
                    isbn: 9780375841941,
                    year: 1954
                },
                stock: {
                    quantity: 50,
                    price: 19.99,
                },
            },
            {
                book: {
                    title: "The Cat in the Hat",
                    author: "Dr. Seuss",
                    isbn: 9780007247882,
                    year: 1957,
                },
                stock: {
                    quantity: 20,
                    price: 5.99,
                },
            },
        ],
    };

    describe("getBooksByAuthor", () => {

        beforeEach(() => {
            const mockAxiosGet = jest.spyOn(axios, "get");
            mockAxiosGet.mockImplementation(async () => testRawDataBooks);
        });

        it("should build the request URL correctly", async () => {
            const apiClient = new BookSearchApiClient();

            await apiClient.getBooksByAuthor("Suess", 10);

            expect(axios.get).toHaveBeenCalledWith(
                "http://api.book-seller-example.com/by-author?q=Suess&limit=10&format=json"
            );

        });

        it("should receive the json data correctly", async () => {
            const expectedBooks: Book[] = [
                {
                    title: "Horton Hears a Who!",
                    author: "Dr. Seuss",
                    isbn: 9780375841941,
                    quantity: 50,
                    price: 19.99,
                }, {
                    author: "Dr. Seuss",
                    isbn: 9780007247882,
                    price: 5.99,
                    quantity: 20,
                    title: "The Cat in the Hat",
                }

            ];
            const apiClient = new BookSearchApiClient("json");

            const actualBooks = await apiClient.getBooksByAuthor("Suess", 10);
            expect(actualBooks).toEqual(expectedBooks);
        });

        it("should convert the XML response into correct object", async () => {
            const xmlResponse: string = `<root><results><item><book><author>Dr. Seuss</author><isbn>9780375841941</isbn><title>Horton Hears a Who</title></book><stock><price>19.99</price><quantity>50</quantity></stock></item><item><book><author>Dr. Seuss</author><isbn>9780007247882</isbn><title>The Cat in the Hat</title></book><stock><price>5.99</price><quantity>20</quantity></stock></item></results></root>`;
            const mockAxiosGet = jest.spyOn(axios, "get");
            mockAxiosGet.mockImplementation(async () => xmlResponse);
            const apiClient = new BookSearchApiClient("xml");
            const res = await apiClient.getBooksByAuthor("Suess", 10);

            expect(res).toStrictEqual([
                {
                    author: "Dr. Seuss",
                    isbn: 9780375841941,
                    price: 19,
                    quantity: 50,
                    title: "Horton Hears a Who",
                },
                {
                    author: "Dr. Seuss",
                    isbn: 9780007247882,
                    price: 5,
                    quantity: 20,
                    title: "The Cat in the Hat",
                },
            ]);
        });

        it("should throw an error if incorrect format provided", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });
            const apiClient = new BookSearchApiClient("text");
            await expect(apiClient.getBooksByAuthor("Mark Twain", 10)).rejects.toThrow("Unsupported Format. Please send response in JSON Object or XML");
            expect(console.error).toHaveBeenCalledWith('Error occured while getting data from', 'http://api.book-seller-example.com/by-author?q=Mark%20Twain&limit=10&format=text');
        });
    });

    describe("getBooksByYear", () => {
        it("should build the request URL correctly", async () => {
            const apiClient = new BookSearchApiClient();

            await apiClient.getBooksByYear(1954, 10);

            expect(axios.get).toHaveBeenCalledWith(
                "http://api.book-seller-example.com/by-year?q=1954&limit=10&format=json"
            );
        });
    });

    describe("getBooksByPublisher", () => {
        it("should build the request URL correctly", async () => {
            const xmlResponse: string = `<root><results><item><book><author>Dr. Seuss</author><isbn>9780375841941</isbn><title>Horton Hears a Who</title></book><stock><price>19.99</price><quantity>50</quantity></stock></item><item><book><author>Dr. Seuss</author><isbn>9780007247882</isbn><title>The Cat in the Hat</title></book><stock><price>5.99</price><quantity>20</quantity></stock></item></results></root>`;
            const mockAxiosGet = jest.spyOn(axios, "get");
            mockAxiosGet.mockImplementation(async () => xmlResponse);
            const apiClient = new BookSearchApiClient("xml");

            await apiClient.getBooksByPublisher("Random House", 10);

            expect(axios.get).toHaveBeenCalledWith(
                "http://api.book-seller-example.com/by-publisher?q=Random%20House&limit=10&format=xml"
            );
        });
    });
});
