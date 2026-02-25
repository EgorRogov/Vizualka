import { describe, it, expect } from 'vitest';
import {
    createUser,
    createBook,
    calculateArea,
    getStatusColor,
    firstLetter,
    trimUppercase,
    getFirstElement,
    findById
} from './lab1';

describe('createUser', () => {

    it('создаёт пользователя с email', () => {
        const user = createUser(1, 'Ivan', 'ivan@test.com');

        expect(user).toEqual({
            id: 1,
            name: 'Ivan',
            email: 'ivan@test.com',
            isActive: true
        });
    });

    it('создаёт пользователя без email', () => {
        const user = createUser(2, 'Maria');

        expect(user.email).toBeUndefined();
        expect(user.isActive).toBe(true);
    });

    it('создаёт неактивного пользователя', () => {
        const user = createUser(3, 'Alex', undefined, false);

        expect(user.isActive).toBe(false);
    });

});

describe('createBook', () => {

    it('создаёт книгу', () => {
        const book = createBook({
            title: 'Test',
            author: 'Author',
            genre: 'fiction'
        });

        expect(book.title).toBe('Test');
        expect(book.genre).toBe('fiction');
    });

});

describe('calculateArea', () => {

    it('вычисляет площадь круга', () => {
        const area = calculateArea('circle', 2);
        expect(area).toBeCloseTo(Math.PI * 4);
    });

    it('вычисляет площадь квадрата', () => {
        const area = calculateArea('square', 3);
        expect(area).toBe(9);
    });

});

describe('getStatusColor', () => {

    it('active -> green', () => {
        expect(getStatusColor('active')).toBe('green');
    });

    it('inactive -> red', () => {
        expect(getStatusColor('inactive')).toBe('red');
    });

    it('new -> blue', () => {
        expect(getStatusColor('new')).toBe('blue');
    });

});

describe('StringFormatter', () => {

    it('firstLetter делает первую букву заглавной', () => {
        expect(firstLetter('hello')).toBe('Hello');
    });

    it('firstLetter uppercase', () => {
        expect(firstLetter('hello', true)).toBe('HELLO');
    });

    it('trimUppercase удаляет пробелы', () => {
        expect(trimUppercase('  hello  ')).toBe('hello');
    });

    it('trimUppercase uppercase', () => {
        expect(trimUppercase('  hello  ', true)).toBe('HELLO');
    });

});

describe('getFirstElement', () => {

    it('возвращает первый элемент массива', () => {
        expect(getFirstElement([1,2,3])).toBe(1);
    });

    it('возвращает undefined для пустого массива', () => {
        expect(getFirstElement([])).toBeUndefined();
    });

});

describe('findById', () => {

    const users = [
        { id: 1, name: 'Ivan' },
        { id: 2, name: 'Maria' }
    ];

    it('находит пользователя по id', () => {
        const user = findById(users, 2);
        expect(user?.name).toBe('Maria');
    });

    it('возвращает undefined если не найден', () => {
        const user = findById(users, 99);
        expect(user).toBeUndefined();
    });

});